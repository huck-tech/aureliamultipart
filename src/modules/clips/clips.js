import { inject, bindable } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import $ from 'jquery';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationController } from 'aurelia-validation';
import { ValidationRules } from 'aurelia-validatejs';
import { subdomainIsCorporate } from 'main';
import config from 'app-config';
import { User } from 'user';
import moment from 'moment';

@inject(HttpClient, EventAggregator, ValidationController, User)
export class Clips {
  pageSizes = [20, 50, 100];

  @bindable isInitializing = true;
  @bindable isLoading = false;
  @bindable distributors = ['[ALL]'];
  @bindable categories = [{ id: 0, name: 'Categories' }];
  @bindable clips = [];
  @bindable selectedClip = null;
  @bindable subdomainIsCorporate = subdomainIsCorporate();

  @bindable searchText = null;
  @bindable fromDate = null;
  @bindable toDate = null;
  @bindable selectedCategory = null;
  @bindable selectedDistributor = null;
  @bindable resultsCount = 0;
  @bindable noResults = false;
  @bindable hasError = false;

  @bindable pageNumber = 0;
  @bindable pageSize = 20;
  @bindable numResults = 0;
  @bindable updatePages = false;
  @bindable resultsWithComma = '0';

  constructor(httpClient, eventAggregator, validationController, user) {
    this.httpClient = httpClient;
    this.eventAggregator = eventAggregator;
    this.validationController = validationController;
    this.user = user;
    this.eventAggregator.subscribe('selectedUserChanged', () => {
      this.search();
    });
  }

  attached() {
    $('.clip-preview').hover(this.hoverVideo, this.hideVideo);
  }
  activate(params) {
    if (params && params.clipId) this.clipId = params.clipId;

    Promise.all([
      this.loadCategories()
      // this.loadDistributors(),
      // this.search()
    ]).then(() => {
      console.log(this.categories);
      this.isInitializing = false;
    });
  }
  hoverVideo = index => {
    let id = '#video' + '-' + index.toString();
    let $id = $(id).get(0);
    if ($id.paused) {
      $id.play();
      // $(id).prop("muted", true);
    }
  };
  hideVideo = index => {
    let id = '#video' + '-' + index.toString();
    let $id = $(id).get(0);
    if (!$id.paused) {
      $id.pause();
    }
  };
  clear() {
    this.searchText = null;
    this.fromDate = null;
    this.toDate = null;
    this.selectedCategory = null;
  }
  numberWithCommas = (number) => {
    this.resultsWithComma = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  loadCategories() {
    if (this.categories.length > 1) return Promise.resolve();

    // return this.httpClient.fetch('/clips/categories', {
    return this.httpClient
      .fetch(config.infoUrls.categoriesUrl, {
        mode: 'cors',
        method: 'get'
      })
      .then(resp => {
        if (resp.ok) {
          return resp
            .json()
            .then(categories =>
              categories.forEach(c => this.categories.push(c))
            );
        }
        console.log(this.categories);
      });
  }

  // loadDistributors() {
  //   if (this.distributors.length > 1) return Promise.resolve();

  //   // return this.httpClient.fetch('/distributors', {
  //   return this.httpClient
  //     .fetch(config.infoUrls.distributorsUrl, {
  //       mode: "cors",
  //       method: "get"
  //     })
  //     .then(resp => {
  //       if (resp.ok) {
  //         return resp
  //           .json()
  //           .then(distributors =>
  //             distributors.forEach(d => this.distributors.push(d))
  //           );
  //       }
  //     });
  // }

  search(pageNumOverride) {
    const errors = this.validationController.validate();
    if (errors.length > 0) {
      this.validationError = errors[0];
      return;
    } 
      this.validationError = null;
    

    // reset
    this.isLoading = true;

    if (pageNumOverride !== undefined) {
      this.pageNumber = pageNumOverride;
    }

    this.noResults = false;
    this.hasError = false;
    this.updatePages = false;
    this.clips.splice(0, this.clips.length);

    // let url = `/clips?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`;
    let url = `summary/v2/clipsdata/?pageNumber=${this.pageNumber}&pageSize=${
      this.pageSize
    }`;

    if (this.clipId) url += `&clipId=${this.clipId}`;

    if (this.user && this.user.selectedUser)
      url += `&userId=${this.user.selectedUser.id}`;

    if (this.searchText) url += `&search=${encodeURI(this.searchText)}`;

    if (this.fromDate) url += `&fromDate=${this.fromDate}`;

    if (this.toDate) url += `&toDate=${this.toDate}`;

    if (this.selectedCategory && this.selectedCategory !== "[ALL]") {
      url += `&clipCategories=${this.selectedCategory.name.replace(
        "&",
        "ampersand"
      )}`;
    }

    if (this.selectedDistributor && this.selectedDistributor !== "[ALL]")
      url += `&distributors=${this.selectedDistributor}`;

    return this.httpClient
      .fetch(url, {
        method: "get",
        mode: "cors"
      })
      .then(resp => {
        // add clips from response
        if (resp.ok) {
          resp.json().then(clips => {
            console.log(clips)
            this.numResults = clips.numResults;
            this.numberWithCommas(this.numResults)
            if (clips.data.length > 0) {
              clips.data.forEach(c => {
                c.duration = c.duration.txt.split(":");
                c.duration =
                  "(" +
                  c.duration[1] +
                  ":" +
                  c.duration[2].split(";")[0].split("'")[0] +
                  ")";
                c.thumbnailUrl =
                  config.clipThumbPrefix + c.userFields["user.62"];
                c.proxyUrl =
                  // "https://s3.amazonaws.com/bloomberg-proxies-clippn-dashboard/" +
                  config.clipProxyPrefix + c.userFields["user.53"];
                c.datetime = moment.unix(c.datetime).format("MM-DD-YYYY");
                this.setResolutionValues(c);
                this.clips.push(c);
                // $('.overlay').mouseout(function() {
                // $('#testvideo').get(0).currentTime = 0;
                this.updatePages = true;
              });
              if (this.clipId && clips.totalItems > 0) {
                this.setSelected(this.clips.items[0], true);
                this.clipId = null;
              }
            } else {
              this.noResults = true;
            }
            this.isLoading = false;
            this.updatePages = true;
          });
        } else {
          this.hasError = true;
          this.isLoading = false;
          this.updatePages = true;
        }
      });
  }

  setResolutionValues(c) {
    switch (c.resolutionType) {
    case 'LessThanHD':
      c.resolutionClass = 'standard';
      c.resolutionDisplay = '<HD';
      break;
    case 'HD':
      c.resolutionClass = 'HD';
      c.resolutionDisplay = 'HD';
      break;
    case '4K':
      c.resolutionClass = '4K';
      c.resolutionDisplay = '4K';
      break;
    default:
      c.resolutionClass = '';
      c.resolutionDisplay = '';
      break;
    }
  }

  setSelected(clip, forceShow) {
    this.selectedClip = clip;

    if (forceShow) $('#clipDetailsModal').modal('show');
  }

  setSelectedCategory(category) {
    this.selectedCategory = category;
  }

  setSelectedDistributor(distributor) {
    this.selectedDistributor = distributor;
  }

  handleKeyPress(e) {
    const keyCode = typeof e.which === 'number' ? e.which : e.keyCode;
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

ValidationRules.ensure('fromDate')
  .date()
  .ensure('toDate')
  .date()
  .dateGreaterThan({ name: 'fromDate', displayName: 'From date' })
  .on(Clips);
