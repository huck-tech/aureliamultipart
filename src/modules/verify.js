import {inject, bindable} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {ValidationController} from 'aurelia-validation';
import {ValidationRules} from 'aurelia-validatejs';
import {AuthService} from 'aurelia-auth';
import {Router} from 'aurelia-router';
import {User} from '../user'
import config from 'app-config';

@inject(HttpClient, Router, AuthService, User)
export class Verify {

    @bindable hasError = false;
    @bindable errorMsg = null;

    constructor(httpClient, router, authService, user) {
        this.httpClient = httpClient;
        this.router = router;
        this.authService = authService;
        this.user = user;
    }

    activate(params) {
       this.httpClient.fetch(config.accountsApiUrls.activateEmailUrl+params.token, {
           mode: 'cors',
           method: 'get'
       })
      .then(resp => {
           if(resp.ok){
               setTimeout(() => {
               //this.router.navigateToRoute('login');
            //    window.location.href = "http://dashboard.clippn.com";
               window.location.href = config.webUrl;
           }, 4000);
           }
           else{
               this.hasError = true;
               resp.json().then(err => {
                   this.errorMsg = `${err.returnData}`;
                   setTimeout(() => {
                   //this.router.navigateToRoute('login');
                //    window.location.href = "http://dashboard.clippn.com";
                   window.location.href = config.webUrl;                   
                   }, 4000);
               });
           }
       });
   }
}