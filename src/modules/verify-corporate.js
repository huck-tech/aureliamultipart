import { inject, bindable } from "aurelia-framework";
import { HttpClient, json } from "aurelia-fetch-client";
import { ValidationController } from "aurelia-validation";
import { ValidationRules } from "aurelia-validatejs";
import { AuthService } from "aurelia-auth";
import { Router } from "aurelia-router";
import { User } from "../user";
import config from "app-config";

@inject(HttpClient, ValidationController, AuthService, Router, User)
export class VerifyCorporate {

  @bindable hasError = false;
  @bindable errorMsg = null;
  @bindable isProcessing = false;
  @bindable newPassword;
  @bindable confirmPassword;
  @bindable errorMsg;
  @bindable passwordReset = false;
  @bindable recovery_token = '';

  constructor(httpClient, validationController, authService, router, user) {
    this.httpClient = httpClient;
    this.validationController = validationController;
    this.authService = authService;
    this.router = router;
    this.user = user;
}

  activate(params) {
    this.recovery_token = params['recovery_token'];
    this.httpClient
      .fetch(config.accountsApiUrls.activateEmailUrl + this.recovery_token, {
        mode: "cors",
        method: "get"
      })
      .then(resp => {
        if (resp.ok) {
          this.passwordReset = true;
        } else {
          this.hasError = true;
          resp.json().then(err => {
            this.errorMsg = `${err.returnData}`;
            setTimeout(() => {
              window.location.href = config.webUrl + '/#/verify-again'
            }, 3000);
          });
        }
      });
  }
  resetPassword() {
    const errors = this.validationController.validate();
    if (errors.length > 0) {
      this.errorMsg = errors[0].message;
      return;
    }
    this.isProcessing = true;
    this.sendNewPassword()
  }
  sendNewPassword() {
    this.httpClient
      .fetch(config.accountsApiUrls.forgotPasswordLinkUrl, {
        mode: "cors",
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: "JWT " + this.recovery_token
        },
        body: json({
          password: this.newPassword
        })
      })
      .then(
        resp => {
          if (resp.ok) {
            this.login();
          } else {
            if (resp.json) {
              resp.json().then(err => {
                this.errorMsg = err.message;
                this.isProcessing = false;
                setTimeout(() => {
                  window.location.href = config.webUrl + '/#/verify-again'
                }, 3000);
              });
            } else {
              this.errorMsg =
                "An unexpected error occurred. If the problem persists, please contact Clippn.";
              this.isProcessing = false;
              setTimeout(() => {
                window.location.href = config.webUrl + '/#/verify-again'
              }, 3000);
            }
          }
        },
        err => {
          this.errorMsg = err.statusText
            ? err.statusText
            : "An unexpected error occurred.";
          this.isProcessing = false;
          setTimeout(() => {
            window.location.href = config.webUrl + '/#/verify-again'
          }, 3000);
        }
      );
  }
  login() {
    window.location.href = config.webUrl;
  }
}

ValidationRules
.ensure('newPassword').required().strongPassword()
.ensure('confirmPassword').required().equality('newPassword')
.on(VerifyCorporate);