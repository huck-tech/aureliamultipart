import {inject, bindable} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ValidationController} from 'aurelia-validation';
import {ValidationRules} from 'aurelia-validatejs';

import $ from 'jquery';

import {User} from 'user';
import config from 'app-config';

@inject(HttpClient, EventAggregator, ValidationController, User)
export class Feedback {
    @bindable searchText = null;
    @bindable toDate = null;
    @bindable fromDate = null;
    @bindable unreadOnly = false;
    @bindable isLoading = false;
    @bindable noResults = false;
    @bindable hasError = false;
    
    @bindable pageNumber = 0;
    @bindable pageSize = 20;
    @bindable numResults = 0;
    @bindable updatePages = false;

    @bindable rawClips = [];
    @bindable selectedRawClip = null;
    @bindable selectedClipHasUnreadFeedback = false;

    constructor(httpClient, eventAggregator, validationController, user) {
        this.httpClient = httpClient;
        this.eventAggregator = eventAggregator;
        this.validationController = validationController;
        this.user = user;

        this.eventAggregator.subscribe('selectedUserChanged', () => {
            this.search();
        });
    }

    activate() {
        this.search();
    }

    attached() {
        $('#feedbackDetailsModal').on('hidden.bs.modal', () => {
            $('#feedbackClipPlayer')[0].pause();
        });
    }

    search(pageNumOverride) {
        if (this.isLoading) return;

        const errors = this.validationController.validate();
        if (errors.length > 0) {
            this.validationError = errors[0];
            return;
        } else {
            this.validationError = null;
        }

        this.hasError = false;
        this.noResults = false;
        this.isLoading = true;
        this.rawClips.splice(0, this.rawClips.length);

        if (pageNumOverride !== undefined) {
            this.pageNumber = pageNumOverride;
        }
        this.updatePages = false;

        let url = `${config.summaryUrls.feedbackUrl}?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`;

        if (this.user && this.user.selectedUser)
            url += `&userId=${this.user.selectedUser.id}`;

        if (this.searchText)
            url += `&search=${encodeURI(this.searchText)}`;

        if (this.fromDate)
            url += `&fromDate=${this.fromDate}`;

        if (this.toDate)
            url += `&toDate=${this.toDate}`;

        url += `&unreadOnly=${this.unreadOnly}`;

        this.httpClient.fetch(url, {
            mode: 'cors',
            method: 'get'
        }).then(resp => {
            if (resp.ok)
                return resp.json().then(rawClips => {
                    if (rawClips.totalResultsFound > 0) {
                        this.numResults = rawClips.totalResultsFound;
                        this.updatePages = true;

                        rawClips.results.forEach(r => {
                            this.setResolutionValues(r);
                            this.setUnreadFeedbackFlag(r);
                            this.rawClips.push(r);
                        });
                    } else {
                        this.noResults = false;
                    }
                    this.isLoading = false;
                });
            else {
                this.hasError = true;
                this.isLoading = false;
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

    setUnreadFeedbackFlag(r) {
        r.hasUnreadFeedback = r.feedback !== null && !r.feedbackRead;
        return r.hasUnreadFeedback;
    }

    setSelectedRawClip(rawClip) {
        this.selectedRawClip = rawClip;
        this.selectedClipHasUnreadFeedback = rawClip.hasUnreadFeedback;
    }

    toggleFeedbackRead() {
        if (!this.selectedRawClip) return;

        var newValue = !this.selectedRawClip.feedbackRead;

        this.httpClient.fetch(`${config.summaryUrls.feedbackReadUrl}?id=${this.selectedRawClip.id}&read=${newValue}`, {
            mode: 'cors',
            method: 'put'
        }).then(resp => {
            if (resp.ok) {
                this.selectedRawClip.feedbackRead = newValue;
                this.selectedClipHasUnreadFeedback = this.setUnreadFeedbackFlag(this.selectedRawClip);
            }
        });
    }

    handleKeyPress(e) {
        const keyCode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keyCode === 13)
            this.search();
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

ValidationRules
    .ensure('fromDate').date()
    .ensure('toDate').date().dateGreaterThan({ name: 'fromDate', displayName: 'From date' })
    .on(Feedback);