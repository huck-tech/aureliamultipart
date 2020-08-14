import { inject, bindable } from "aurelia-framework";
import { HttpClient } from "aurelia-fetch-client";
import { EventAggregator } from "aurelia-event-aggregator";
import { ValidationController } from "aurelia-validation";
import { ValidationRules } from "aurelia-validatejs";
import config from "app-config";

import { User } from "user";

@inject(HttpClient, EventAggregator, User, ValidationController)
export class Sales {
  @bindable isLoading = false;

  @bindable searchText = null;
  @bindable fromDate = null;
  @bindable toDate = null;

  @bindable transactions = [];
  @bindable noResults = false;
  @bindable hasError = false;

  @bindable pageNumber = 0;
  @bindable pageSize = 20;
  @bindable numResults = 0;
  @bindable updatePages = false;
  @bindable salesData = [];

  constructor(httpClient, eventAggregator, user, validationController) {
    this.httpClient = httpClient;
    this.eventAggregator = eventAggregator;
    this.user = user;
    this.validationController = validationController;

    // this.eventAggregator.subscribe("selectedUserChanged", () => {
    //   this.search();
    // });
  }

  activate() {
    // this.search().then(() => {
    //     this.isLoading = false;
    // });
    this.getSalesData();
  }
  getSalesData() {
    this.httpClient
      .fetch(config.summaryUrls.getSalesUrl, {
        method: "get",
        mode: "cors"
      })
      .then(resp => {
        // add transactions from response
        if (resp.ok)
          resp.json().then(transactions => {
            this.salesData = transactions;
          });
        else {
          this.hasError = true;
          this.isLoading = false;
        }
      });
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
    this.noResults = false;
    this.hasError = false;
    this.transactions.splice(0, this.transactions.length);

    if (pageNumOverride !== undefined) {
      this.pageNumber = pageNumOverride;
    }
    this.updatePages = false;

    let url = `/sales?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`;

    if (this.user && this.user.selectedUser)
      url += `&userId=${this.user.selectedUser.id}`;

    if (this.searchText) url += `&searchText=${encodeURI(this.searchText)}`;

    if (this.fromDate) url += `&fromDate=${this.fromDate}`;

    if (this.toDate) url += `&toDate=${this.toDate}`;

    return this.httpClient
      .fetch(url, {
        method: "get",
        mode: "cors"
      })
      .then(resp => {
        // add transactions from response
        if (resp.ok)
          resp.json().then(transactions => {
            if (transactions.totalResultsFound > 0) {
              this.numResults = transactions.totalResultsFound;
              this.updatePages = true;

              transactions.results.forEach(t => {
                this.transactions.push(t);
              });
            } else this.noResults = true;

            this.isLoading = false;
          });
        else {
          this.hasError = true;
          this.isLoading = false;
        }
      });
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
  .on(Sales);
