import {inject, bindable} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {ValidationController} from 'aurelia-validation';
import {ValidationRules} from 'aurelia-validatejs';
import {Router} from 'aurelia-router';
import config from 'app-config';
import {User} from 'user';

@inject(HttpClient, ValidationController, Router, User)
export class Contact {
    
    @bindable isSubmitted = false;
    @bindable isSubmiting = false;
    @bindable hasError = false;
    @bindable errorMsg = null;
    @bindable name = null;
    @bindable email = '';
    @bindable comments = '';
    
    constructor(httpClient, validationController, router, user) {
        this.httpClient = httpClient;
        this.validationController = validationController;
        this.router = router;
        this.user = user;
    }

    submitcomments() {
        const errors = this.validationController.validate();
        if (errors.length > 0) return;

        this.hasError = false;
        this.isSubmiting = true;
        // check if the validation is valid before performing the register
        this.httpClient.fetch(config.accountsApiUrls.contactFormUrl, {
                mode: 'cors',
                method: 'post',
                body: json({
                    email_id : this.user.dataField.email,
                    comments: this.comments
                })
            })
            .then(resp => {
                

                if (resp.ok) {
                    // this.isRegistered = true;
                    this.isSubmiting = false;
                    this.isSubmitted = true;
                    // this.router.navigate('verify');
                } else {
                    this.hasError = true;
                    resp.json().then(err => {
                        this.errorMsg = `(${err.code}): ${err.message}`;
                    });
                }
            });
                // console.log("This is it " + this.name + "   " + this.email + "   " + this.comments);
    }
}

ValidationRules
    .ensure('comments').required()
    // .ensure('name').required()
    // .ensure('email').required().email()
    .on(Contact);