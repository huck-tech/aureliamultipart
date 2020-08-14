import {inject, bindable} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {ValidationController} from 'aurelia-validation';
import {ValidationRules} from 'aurelia-validatejs';
import {Router} from 'aurelia-router';
import config from 'app-config';

@inject(HttpClient, ValidationController, Router)
export class Register {
    
    @bindable isRegistered = false;
    @bindable isRegistering = false;
    @bindable hasError = false;
    @bindable errorMsg = null;
    @bindable firstName = null;
    @bindable lastName = null;
    @bindable email = '';
    @bindable password = '';
    @bindable confirmPassword = '';
    @bindable heardFrom = '';
    
    constructor(httpClient, validationController, router) {
        this.httpClient = httpClient;
        this.validationController = validationController;
        this.router = router;
    }

    // createNewUser() {
    //     const errors = this.validationController.validate();
    //     if (errors.length > 0) return;

    //     this.hasError = false;
    //     this.isRegistering = true;

    //     // check if the validation is valid before performing the register
    //     this.httpClient.fetch(config.accountsApiUrls.signupUrl, {
    //             mode: 'cors',
    //             method: 'post',
    //             body: json({
    //                 first_name: this.firstName,
    //                 last_name: this.lastName,
    //                 email_id: this.email,
    //                 password: this.password,
    //                 heard_from: this.heardFrom,
    //                 subdomain: config.subdomain,
    //                 user_role: 'ctb',
    //                 is_admin: 'False',
    //                 roleId: 3
    //             })
    //         })
    //         .then(resp => {
    //             this.isRegistering = false;

    //             if (resp.ok) {
    //                 this.isRegistered = true;
    //                 // this.router.navigate('verify');
    //             } else {
    //                 this.hasError = true;
    //                 resp.json().then(err => {
    //                     this.errorMsg = `(${err.code}): ${err.message}`;
    //                 });
    //             }
    //         });
    // }
}

ValidationRules
    .ensure('firstName').required()
    .ensure('lastName').required()
    .ensure('email').required().email()
    .ensure('password').required().strongPassword()
    .ensure('confirmPassword').required().equality('password')
    .on(Register);