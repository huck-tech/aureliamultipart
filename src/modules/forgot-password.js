import {inject, bindable} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import config from 'app-config';

@inject(HttpClient)
export class ForgotPassword {

    @bindable emailAddress;
    @bindable errorMsg;
    @bindable isProcessing = false;
    @bindable passwordReset = false;
    
    constructor(httpClient) {
        this.httpClient = httpClient;
    }

    resetPassword() {
        this.isProcessing = true;

        this.httpClient.fetch(config.accountsApiUrls.forgotPasswordViewUrl, {
            mode: 'cors',
            method: 'post',
            body: json({
                email_id: this.emailAddress
            })
        }).then(resp => {
            if (resp.ok) {
                this.passwordReset = true;
                this.isProcessing = false;
            } else {
                resp.json().then(err => {
                    this.errorMsg = err.returnData;
                    this.isProcessing = false;
                });
            }
        });
    }
}