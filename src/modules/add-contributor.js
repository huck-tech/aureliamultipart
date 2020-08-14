import { bindable, inject, computedFrom } from "aurelia-framework";
import {HttpClient, json} from 'aurelia-fetch-client';
import { ValidationController } from "aurelia-validation";
import { ValidationRules } from "aurelia-validatejs";
import { User } from "user";
import config from 'app-config';

@inject(HttpClient, ValidationController, User)
export class AddContributor {    
  
  @bindable user = null;
  @bindable isCreated = null;
  @bindable hasError = false;
  @bindable errorMsg = null;
  @bindable firstName = null;
  @bindable lastName = null;
  @bindable isRegistering = null;
  @bindable email = "";
  lastKeyUp = null;
  curSearchResp = null;

  constructor(httpClient, validationController, user) {
    this.httpClient = httpClient;
    this.validationController = validationController;    
    this.user = user;
  }

  @computedFrom("user", "adminUsers")
  get users() {
    if (this.user.isRep) {
      return this.user.repContributors;
    } else if (this.user.isAdmin) {
      return this.adminUsers;
    } else {
      return [];
    }
  }

  addNewUser() {
    this.isCreated = false;
    const errors = this.validationController.validate();
    if (errors.length > 0) return;

    this.hasError = false;
    this.isRegistering = true;

    if (this.user.isAdmin || this.user.isRep) {
      // check if the validation is valid before performing the register
      this.httpClient
        .fetch(config.accountsApiUrls.signupUrl, {
          mode: "cors",
          method: "post",
          body: json({
            first_name: this.firstName,
            last_name: this.lastName,
            email_id: this.email,
            subdomain: config.subdomain,
            heard_from: 'Bloomberg',
            user_role: 'ctb',
            is_admin: 'False',
            roleId: 3
          })
        })
        .then(resp => {
          if (resp.ok) {
            this.isCreated = true;
            this.firstName = null;
            this.lastName = null;
            this.email = "";
            this.isRegistering = false;
          } else {
            this.hasError = true;
            resp.json().then(err => {
              this.errorMsg = `(${err.code}): ${err.message}`;
            });
          }
        });
      }
  }
}
ValidationRules.ensure("firstName")
  .required()
  .ensure("lastName")
  .required()
  .ensure("email")
  .required()
  .email()
  .on(AddContributor);
