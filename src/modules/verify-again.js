import {inject, bindable} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import config from 'app-config';

@inject(HttpClient)
export class VerifyAgain {

    @bindable emailAddress;
    @bindable errorMsg;
    @bindable isProcessing = false;
    @bindable resendToken = false; //changed from  passwordReset
    
    constructor(httpClient) {
        this.httpClient = httpClient;
    }

    // resendVerificationToken() {  // name changed from resetPassword()
    //     this.isProcessing = true;
    //     const email_id = this.emailAddress;
    //     const postBody = json(email_id);
    //     console.log(email_id)
    //     console.log(config.accountsApiUrls.)

    //     this.httpClient.fetch(config.accountsApiUrls.forgotPasswordViewUrl, {
    //         mode: 'cors',
    //         method: 'post',
    //         body: json({
    //                 email_id: this.emailAddress,
    //             })
    //     }).then(resp => {
    //         if (resp.ok) {
    //             this.resendToken = true;
    //             this.isProcessing = false;
    //         } else {
    //             resp.json().then(err => {
    //                 this.errorMsg = err.message;
    //                 this.isProcessing = false;
    //             });
    //         }
    //     });
    // }

    resendVerificationToken() {  // name changed from resetPassword()
        this.isProcessing = true;
        console.log(this.emailAddress);
        this.httpClient.fetch(config.accountsApiUrls.resendActivationEmailUrl, {
            mode: 'cors',
            method: 'post',
            body: json({
                email_id: this.emailAddress
            })
        }).then(resp => {
            if (resp.ok) {
                this.resendToken = true;
                this.isProcessing = false;
            } else {
                resp.json().then(err => {
                    console.log(resp.json())
                    this.errorMsg = err.message;
                    this.isProcessing = false;
                });
            }
        });
    }

}