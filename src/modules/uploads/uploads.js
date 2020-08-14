import { inject, bindable, computedFrom } from "aurelia-framework";
import { HttpClient } from "aurelia-fetch-client";
import { EventAggregator } from "aurelia-event-aggregator";
import { ValidationController } from "aurelia-validation";
import { ValidationRules } from "aurelia-validatejs";
import moment from 'moment-timezone';
import $ from "jquery";

import { UploadManager } from "common/uploads/upload-manager";
import { User } from "user";
import config from "app-config";

@inject(HttpClient, UploadManager, EventAggregator, ValidationController, User)
export class Uploads {
  @bindable packages = [];
  @bindable packageCount = 0;
  @bindable rawClipCount = 0;

  @bindable isInitializing = false;
  @bindable isLoading = false;
  @bindable searchText = null;
  @bindable fromDate = null;
  @bindable toDate = null;
  @bindable includeFailed = false;

  @bindable selectedPackage;

  @bindable noResults = false;
  @bindable hasError = false;

  @bindable pageNumber = 0;
  @bindable pageSize = 20;
  @bindable numResults = 0;
  @bindable updatePages = false;
  @bindable resultsWithComma = '0';

  constructor(
    httpClient,
    uploadManager,
    eventAggregator,
    validationController,
    user
  ) {
    this.httpClient = httpClient;
    this.uploadManager = uploadManager;
    this.eventAggregator = eventAggregator;
    this.validationController = validationController;
    this.user = user;

    this.eventAggregator.subscribe("selectedUserChanged", () => {
      this.refreshAll();
    });
  }

  @computedFrom("selectedPackage")
  get selectedPackageId() {
    return this.selectedPackage ? this.selectedPackage.id : null;
  }

  attached() {
    $("#current-upload-modal").on("hidden.bs.modal", () => {
      this.selectedPackage = null;
    });
  }

  activate() {
    this.refreshAll();
  }

  deactivate() {
    this.validationError = null;
  }

  refreshAll() {
    this.isInitializing = true;

    return Promise.all([this.search()]).then(() => {
      this.isInitializing = false;
    });
  }
  clear() {
    this.searchText = null;
    this.fromDate = null;
    this.toDate = null;
  }
  // getCounts() {
  //   // console.log('counts')
  //   let url = config.packageApiUrls.countUrl;
  //   if (this.user && this.user.selectedUser) {
  //     url += `?userId=${this.user.selectedUser.id}`;
  //   }
  //   return this.httpClient
  //     .fetch(url, {
  //       mode: "cors",
  //       method: "get"
  //     })
  //     .then(resp => {
  //       if (resp.ok) {
  //         return resp.json().then(obj => {
  //           console.log("obj", obj);
  //           this.packageCount = obj.packageCount;
  //           this.rawClipCount = obj.clipCount || 0;
  //         });
  //       }
  //     });
  // }
  numberWithCommas = (number) => {
    this.resultsWithComma = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  search(pageNumOverride) {
    const errors = this.validationController.validate();
    if (errors.length > 0) {
      this.validationError = errors[0];
      return;
    } else {
      this.validationError = null;
    }

    // reset
    this.isLoading = true;
    if (pageNumOverride !== undefined) {
      this.pageNumber = pageNumOverride;
    }

    this.noResults = false;
    this.hasError = false;
    this.updatePages = false;
    this.packages.splice(0, this.packages.length);

    // let url = `/uploads?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`;
    let url = `${config.packageApiUrls.getPackages}?pageNumber=${
      this.pageNumber
    }&pageSize=${this.pageSize}`;

    if (this.user && this.user.selectedUser) url += `&userId=${this.user.selectedUser.id}`;
    
    if (this.searchText) url += `&search=${encodeURI(this.searchText)}`;

    if (this.fromDate) url += `&fromDate=${this.fromDate}`;

    if (this.toDate) url += `&toDate=${this.toDate}`;

    url += `&includeFailed=${this.includeFailed}`;

    return this.httpClient
      .fetch(url, {
        method: "get",
        mode: "cors"
      })
      .then(resp => {
        // add packages from response
        if (resp.ok) {
          resp.json().then(response => {
            let packages = response.uploads;
            this.numResults = response.numResults;
            this.numberWithCommas(this.numResults)
            this.updatePages = true;
            // this.rawClipCount = packages.totalClipsFound;
            if (packages.length > 0) {
              packages.forEach(pkg => {
                if (pkg.created_at) {
                  pkg.created_at = pkg.created_at.split(".")[0]
                    if (moment('2018-05-15').isBefore(pkg.created_at)) {
                        pkg.newishUpload = true;
                    } else {
                      pkg.newishUpload = false;
                    }
                  let date = moment(pkg.created_at, 'YYYY-MM-DD HH:mm:ss').valueOf()
                  pkg.created_at = date;
                } else {
                  pkg.created_at = null;
                }
                this.packages.push(pkg)
              });
              // console.log(this.packages)
            } else {
              this.noResults = true;
            }
            this.isLoading = false;
            this.updatePages = true;
          });
        } else {
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }

  setSelected(pkg) {
    this.selectedPackage = pkg;
  }

  handleKeyPress(e) {
    const keyCode = typeof e.which === "number" ? e.which : e.keyCode;
    if (keyCode === 13) this.search();
    return true;
  }

  pageNumberChanged() {
    if (!this.isLoading) {
      this.search();
    }
  }

  pageSizeChanged() {
    if (this.pageNumber !== 0) {
      this.pageNumber = 0;
    } else {
      this.search();
    }
  }
}

ValidationRules.ensure("fromDate")
  .date()
  .ensure("toDate")
  .date()
  .dateGreaterThan({ name: "fromDate", displayName: "From date" })
  .on(Uploads);
