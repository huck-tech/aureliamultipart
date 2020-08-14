import {inject, bindable} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {PLATFORM} from 'aurelia-pal';
import $ from 'jquery';
import config from 'app-config';

@inject(HttpClient, PLATFORM)
export class Payments {

    @bindable iframeLoading = true;

    constructor(httpClient, platform) {
        this.httpClient = httpClient;

        platform.addEventListener('message', () => this.iframeLoading = false);
    }

    activate() {
        this.iframeLoading = true;

        this.httpClient.fetch(config.contributorApiUrls.userPaymentHistoryUrl, {
            mode: 'cors',
            method: 'get'
        }).then(resp => {
            if (resp.ok) {
                resp.json().then(data => {
                    this.iframeUrl = data.iframeUrl;
                });
            }
        });
    }
}