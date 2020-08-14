import { bindable, inject, computedFrom } from "aurelia-framework";
import { HttpClient, json } from "aurelia-fetch-client";
import { Router } from "aurelia-router";
import { PLATFORM } from "aurelia-pal";
import { countries } from "country-data";
import { User } from "user";
import config from "app-config";

@inject(HttpClient, Router, countries, User, PLATFORM)
export class ProfileCompletion {
  @bindable processing = false;
  @bindable loadingContract = false;
  @bindable contractLoadFailed = false;
  @bindable stepNumber = 1;
  @bindable contractAccepted = false;
  @bindable contract;
  @bindable membershipPaid = false;
  @bindable showPayment = true;
  @bindable braintreeToken;
  @bindable paymentInfoIframeUrl;
  @bindable paymentInfoIframeLoading = true;

  @bindable contactInfo;
  @bindable additionalInfo;

  selectedCountryField = null;

  constructor(httpClient, router, countries, user, platform) {
    this.httpClient = httpClient;
    this.router = router;
    this.countries = countries;
    this.user = user;

    this.contactInfo = {
      addressLine1: null,
      addressLine2: null,
      city: null,
      stateOrProvince: null,
      country: null,
      countryCode: null,
      zipCode: null,
      phoneNumber: null
    };

    this.additionalInfo = {
      owns4KCamera: false,
      interestsInfo: null,
      travelInfo: null,
      hobbiesInfo: null
    };
    console.log(this.user)
    platform.addEventListener(
      "message",
      () => (this.paymentInfoIframeLoading = false)
    );
  }

  get owns4KCamera() {
    return this.additionalInfo.owns4KCamera ? "on" : "off";
  }
  set owns4KCamera(value) {
    this.additionalInfo.owns4KCamera = value === "on";
  }

  @computedFrom("owns4KCamera")
  get doesntOwn4KCamera() {
    return this.owns4KCamera === "on" ? "off" : "on";
  }
  set doesntOwn4KCamera(value) {
    this.owns4KCamera = value === "on" ? "off" : "on";
  }

  get sortedCountries() {
    return this.countries.all
      .filter(c => c.status !== "reserved")
      .sort((c1, c2) => c1.name.localeCompare(c2.name));
  }

  get selectedCountry() {
    return this.selectedCountryField;
  }
  set selectedCountry(country) {
    this.selectedCountryField = country;
    this.contactInfo.country = country.name;
    this.contactInfo.countryCode = country.alpha2;
  }

  @computedFrom("contract")
  get contractText() {
    return this.contract && this.contract.text
      ? this.contract.text
      : "An error occurred loading the contract. Please contact Clippn if the problem persists.";
  }

  activate() {
    if (!this.user.hasSignedContract) this.getContract();
    else this.stepNumber = 2;

    var button = document.querySelector("#submit-button");
  }

  getContract() {
    let self = this;
    this.loadingContract = true;
    console.log("Getting contract");

    this.httpClient
      .fetch(config.contributorApiUrls.contractDetailsUrl, {
        mode: "cors",
        method: "get"
      })
      .then(
        resp => {
          this.loadingContract = false;
          if (resp.ok) {
            resp.json().then(contract => {
              this.contract = contract;
              this.contractLoadFailed = this.contract === null;
              const button = document.querySelector("#submit-button");
              braintree.dropin.create(
                {
                  authorization: contract.token,
                  container: "#dropin-container",
                  paypal: {
                    singleUse: true,
                    amount: 149.00,
                    currency: "USD",
                    button: {
                      type: "checkout"
                    }
                  }
                },
                function(createErr, instance) {
                  button.addEventListener("click", function() {
                    instance.requestPaymentMethod(function(err, payload) {
                      console.log("submitting", payload);
                      // Submit payload.nonce to your server
                      self.httpClient
                        .fetch(config.contributorApiUrls.contractPaymentUrl, {
                          mode: "cors",
                          method: "post",
                          body: json({
                            nonce: payload.nonce,
                            user_id: self.user.dataField.id
                          })
                        })
                        .then(resp2 => {
                            if (resp2.ok) {
                                self.membershipPaid = true;
                                self.showPayment = false;
                            }
                            else {
                                console.log('payment failed')
                            }
                        });
                    });
                  });
                }
              );
            });
          } else {
            this.contractLoadFailed = true;
          }
        },
        () => {
          this.contractLoadFailed = true;
        }
      );
  }

  signContract() {
    if (!this.contract || !this.contractAccepted) return;

    this.processing = true;

    this.httpClient
      .fetch(config.contributorApiUrls.contractDetailsUrl, {
        mode: "cors",
        method: "post",
        body: json({
          user_signed_contract: "true"
        })
      })
      .then(resp => {
        this.processing = false;
        if (resp.ok) {
          resp.json().then(data => {
            this.user.data = data;
            this.moveNext();
          });
        }
      });
  }

  moveBack() {
    if (this.stepNumber > 1) this.stepNumber--;
  }

  moveNext() {
    if (this.stepNumber < 4) this.stepNumber++;
  }

  updateContactInfo() {
    this.processing = true;
    this.httpClient
      .fetch(config.contributorApiUrls.userContactUpdate, {
        mode: "cors",
        method: "put",
        body: json({
          address_line_1: this.contactInfo.addressLine1,
          address_line_2: this.contactInfo.addressLine2,
          city: this.contactInfo.city,
          state: this.contactInfo.stateOrProvince,
          country: this.contactInfo.country,
          zip_code: this.contactInfo.zipCode,
          phone: this.contactInfo.phoneNumber
        })
      })
      .then(resp => {
        if (resp.ok) {
          return resp.json().then(data => {
            this.user.data = data;
            this.paymentInfoIframeLoading = true;

            return this.httpClient
              .fetch(config.contributorApiUrls.userPaymentSetupUrl, {
                mode: "cors",
                method: "get"
              })
              .then(resp2 => {
                this.processing = false;
                if (resp2.ok) {
                  resp2.json().then(data => {
                    this.paymentInfoIframeUrl = data.iframeUrl;
                    this.moveNext();
                  });
                }
              });
          });
        } else {
          this.processing = false;
        }
      });
  }

  updateAdditionalInfo() {
    this.processing = true;
    this.httpClient
      .fetch(config.contributorApiUrls.userAdditionInfoUrl, {
        mode: "cors",
        method: "put",
        body: json({
          owns_4k_camera: this.additionalInfo.owns4KCamera,
          interests_info: this.additionalInfo.interestsInfo,
          travel_info: this.additionalInfo.travelInfo,
          hobbies_info: this.additionalInfo.hobbiesInfo
        })
      })
      .then(resp => {
        if (resp.ok)
          resp.json().then(data => {
            this.user.data = data;
            this.complete();
          });
      });
  }
  complete() {
    this.router.navigateToRoute("dashboard");
  }
}
