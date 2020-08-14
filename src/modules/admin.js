import { inject, bindable } from "aurelia-framework";
import { HttpClient, json } from "aurelia-fetch-client";
import { ValidationController } from "aurelia-validation";
import { ValidationRules } from "aurelia-validatejs";
import config from "app-config";
import { User } from "user";

@inject(HttpClient, User, ValidationController)
export class Admin {
  @bindable isAdmin;
  @bindable selectedRole = "";
  @bindable isCreated = false;
  @bindable hasError = false;
  @bindable errorMsg = null;
  @bindable firstName = null;
  @bindable lastName = null;
  @bindable email = "";

  lastKeyUp = null;
  curSearchResp = null;

  constructor(httpClient, user, validationController) {
    this.httpClient = httpClient;
    this.user = user;
    this.validationController = validationController;
  }

  activate() {
    this.isAdmin = this.user.isAdmin;
  }

  clearForm() {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.selectedRole = '';
  }
  addNewUser() {
    const errors = this.validationController.validate();
    if (errors.length > 0) return;
    this.hasError = false;
    this.isRegistering = true;
    if (this.isAdmin) {
      let roleId;
      let is_admin;
      let subdomain;
      if (this.selectedRole !== "adm") {
        this.selectedRole = "rep";
        roleId = 2;
        is_admin = "False";
        subdomain = 'Bloomberg'
      } else {
        this.selectedRole = "adm";
        roleId = 1;
        is_admin = "True";
        subdomain = 'Admin'
      }
      // check if the validation is valid before performing the register
      this.httpClient
        .fetch(config.accountsApiUrls.signupUrl, {
          mode: "cors",
          method: "post",
          body: json({
            first_name: this.firstName,
            last_name: this.lastName,
            email_id: this.email,
            subdomain: subdomain,
            user_role: this.selectedRole,
            is_admin: is_admin,
            heard_from: 'Bloomberg',
            roleId: roleId
          })
        })
        .then(resp => {
          if (resp.ok) {
            this.isCreated = true;
            this.clearForm()
            this.isRegistering = false;
            // this.router.navigate('verify');
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
  .on(Admin);
