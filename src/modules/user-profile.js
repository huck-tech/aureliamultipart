import {inject, bindable, computedFrom} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {PLATFORM} from 'aurelia-pal';
import { subdomainIsCorporate } from 'main'

import {User} from 'user';
import $ from 'jquery';
import config from 'app-config';

@inject(HttpClient, User, PLATFORM)
export class UserProfile {
    
    @bindable paymentInfoIframeUrl;
    @bindable paymentInfoIframeLoading = true;
    @bindable subdomainIsCorporate = subdomainIsCorporate();    
    @bindable email;
    @bindable firstName;
    @bindable lastName;
    @bindable contactData;
    @bindable additionalData;
    
    @bindable contactDataInEditMode = false;
    @bindable additionalDataInEditMode = false;

    @bindable loadingContract = false;
    @bindable loadContractFailed = false;
    @bindable contract = null;

    constructor(httpClient, user, platform) {
        this.httpClient = httpClient;
        this.user = user;

        platform.addEventListener('message', () => this.paymentInfoIframeLoading = false);

        this.setDataFromUser();
    }

    @computedFrom('contract')
    get contractText() {
        return this.contract && this.contract.text ? this.contract.text : 'An error occurred loading the contract. Please contact Clippn if the problem persists.';
    }

    get owns4KCamera() {
        return this.additionalData.owns4KCamera ? 'on' : 'off';
    }
    set owns4KCamera(value) {
        this.additionalData.owns4KCamera = value === 'on';
    }

    @computedFrom('owns4KCamera')
    get doesntOwn4KCamera() {
        return this.owns4KCamera === 'on' ? 'off' : 'on';
    }
    set doesntOwn4KCamera(value) {
        this.owns4KCamera = value === 'on' ? 'off' : 'on';
    }

    activate() {
        this.setDataFromUser();

        this.paymentInfoIframeLoading = true;

        this.httpClient.fetch(config.contributorApiUrls.userPaymentSetupUrl, {
            mode: 'cors',
            method: 'get'
        }).then(resp => {
            if (resp.ok) {
                resp.json().then(data => {
                    this.paymentInfoIframeUrl = data.iframeUrl;
                });
            }
        });
    }

    attached() {
        $('#contract-modal').on('shown.bs.modal', () => {
            this.getContract();
        });
    }

    setDataFromUser() {
        this.contactData = this.createCopy(this.user.data.contactInfo) || {};
        this.contactData.email = this.user.data.email;
        this.contactData.firstName = this.user.data.firstName;
        this.contactData.lastName = this.user.data.lastName;

        this.additionalData = this.createCopy(this.user.data.additionalInfo);
    }

    createCopy(obj) {
        const copy = {};

        for (const prop in obj)
            if (obj.hasOwnProperty(prop))
                copy[prop] = obj[prop];

        return obj;
    }

    enterContactDataEditMode() {
        this.contactDataInEditMode = true;
    }

    exitContactDataEditMode(save) {
        if (save) {
            
            // this.httpClient.fetch('/users/contactInfo', {
            //     mode: 'cors',
            //     method: 'put',
            //     body: json(this.contactData)
            // })
            this.httpClient.fetch(config.contributorApiUrls.userDashboardInfoUpdateUrl, {
                mode: 'cors',
                method: 'post',
                body: json({
                    first_name : this.contactData.firstName,
                    last_name : this.contactData.lastName,
                    email_id : this.contactData.email,
                    address_line_1 : this.contactData.addressLine1,
                    address_line_2 : this.contactData.addressLine2,
                    city : this.contactData.city,
                    state : this.contactData.stateOrProvince,
                    country : this.contactData.country,
                    zip_code :  this.contactData.zipCode,
                    phone : this.contactData.phoneNumber
                })
            }).then(resp => {
                if (resp.ok) {
                    resp.json().then(data => {
                        this.user.data = data;
                        this.setDataFromUser();
                        this.contactDataInEditMode = false;
                    });
                }
            });
        } else {
            this.setDataFromUser();
            this.contactDataInEditMode = false;
        }
    }

    enterAdditionalDataEditMode() {
        this.additionalDataInEditMode = true;
    }

    exitAdditionalDataEditMode(save) {
        if (save) {
            // this.httpClient.fetch('/users/additionalInfo', {
            //     mode: 'cors',
            //     method: 'put',
            //     body: json(this.additionalData)
            // })
            this.httpClient.fetch(config.contributorApiUrls.userAdditionInfoUrl, {
                mode: 'cors',
                method: 'put',
                body: json({
                    owns_4k_camera : this.additionalData.owns4KCamera,
                    interests_info : this.additionalData.interestsInfo,
                    travel_info : this.additionalData.travelInfo,
                    hobbies_info : this.additionalData.hobbiesInfo
                })
            }).then(resp => {
                if (resp.ok) {
                    resp.json().then(data => {
                        this.user.data = data;
                        this.setDataFromUser();
                        this.additionalDataInEditMode = false;
                    });
                }
            });
        } else {
            this.setDataFromUser();
            this.additionalDataInEditMode = false;
        }
    }

    getContract() {
        if (!this.user.data) {
            this.contractLoadFailed = true;
            return;
        }
        
        this.contractLoadFailed = false;
        this.loadingContract = true;

        this.httpClient.fetch(config.contributorApiUrls.contractDetailsUrl, {
            mode: 'cors',
            method: 'get'
        }).then(resp => {
            this.loadingContract = false;
            if (resp.ok) {
                resp.json().then(contract => {
                    this.contract = contract;
                    this.contractLoadFailed = this.contract === null;
                });
            } else {
                this.contractLoadFailed = true;
            }
        },
        () => {
            this.contractLoadFailed = true;
        });
    }

    closeContractModal() {
        $('#contract-modal').modal('hide');
    }
}