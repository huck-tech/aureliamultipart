import {inject, bindable} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {ValidationController} from 'aurelia-validation';
import {ValidationRules} from 'aurelia-validatejs';
import {AuthService} from 'aurelia-auth';
import {Router} from 'aurelia-router';
import {User} from '../user'
import config from 'app-config';

@inject(HttpClient, ValidationController, AuthService, Router, User)
export class ResetPassword {
    
    @bindable isProcessing = false;
    @bindable newPassword;
    @bindable confirmPassword;
    @bindable errorMsg;

    constructor(httpClient, validationController, authService, router, user) {
        this.httpClient = httpClient;
        this.validationController = validationController;
        this.authService = authService;
        this.router = router;
        this.user = user;
    }

    activate(params) {
        this.emailAddress = params.emailAddress;
        this.token = params.token;
    }

    resetPassword() {
        const errors = this.validationController.validate();
        if (errors.length > 0) {
            this.errorMsg = errors[0].message;
            return;
        }

        this.isProcessing = true;

        this.httpClient.fetch(config.accountsApiUrls.forgotPasswordLinkUrl, {    
            mode: 'cors',
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "JWT "+this.token
            },
            body: json({
                password: this.newPassword
            })
        }).then(resp => {
            if (resp.ok) {
                console.log("Reset. Going to login");
                this.login();
            } else {
                if (resp.json) {
                    console.log("Printing json :"+resp.json);
                    resp.json().then(err => {
                        this.errorMsg = err.message;
                        this.isProcessing = false;
                    });
                }  else {
                    this.errorMsg = 'An unexpected error occurred. If the problem persists, please contact Clippn.';
                    this.isProcessing = false;
                }
            }
        }, err => {
            this.errorMsg = err.statusText ? err.statusText : 'An unexpected error occurred.';
            this.isProcessing = false;
        });
    }

    login() {
        this.authService.login({
                email_id: this.emailAddress,
                password: this.newPassword,
                subdomain: config.subdomain
            })
            .then(response => {
                this.user.login(response.user).then(() => {
                    this.router.navigate('dashboard');
                });
            })
            .catch(resp => {
                this.isProcessing = false;
                if (resp.status &&  resp.status === 401)
                    this.errorMsg = 'Failed to login. The server returned a (401) Unauthorized response.';
                else
                    this.errorMsg = 'An unexpected error occurred. If the problem persists, please contact Clippn.';
            });
        // window.location.href = config.webUrl;
        //     console.log(this.errorMsg);
    }
}

ValidationRules
    .ensure('newPassword').required().strongPassword()
    .ensure('confirmPassword').required().equality('newPassword')
    .on(ResetPassword);