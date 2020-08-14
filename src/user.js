import { inject, bindable, computedFrom } from "aurelia-framework";
import { HttpClient, json } from "aurelia-fetch-client";
import { AuthService, FetchConfig } from "aurelia-auth";
import { EventAggregator } from "aurelia-event-aggregator";
import { Redirect } from "aurelia-router";
import jwt_decode from "jwt-decode";
import config from "app-config";
import { subdomainIsCorporate } from "main";


@inject(AuthService, EventAggregator, FetchConfig, HttpClient)
export class User {
  loggedIn = false;
  initialized = false;
  selectedUserField = null;
  dataField = null;

  @bindable repContributors = [];

  constructor(auth, eventAggregator, fetchConfig, httpClient) {
    this.auth = auth;
    this.eventAggregator = eventAggregator;
    this.fetchConfig = fetchConfig;
    this.httpClient = httpClient;
  }

  get selectedUser() {
    return this.selectedUserField;
  }
  set selectedUser(value) {
    this.selectedUserField = value;
    this.eventAggregator.publish("selectedUserChanged", this.selectedUserField);
  }

  get rememberMe() {
    if ("localStorage" in window && window["localStorage"] !== null) {
      return localStorage.getItem("clippnRememberMe") === "true";
    }
  }
  set rememberMe(value) {
    if ("localStorage" in window && window["localStorage"] !== null) {
      localStorage.setItem("clippnRememberMe", value);
    }
  }

  get timeUntilTokenExpiration() {
    if (this.auth.isAuthenticated()) {
      const token = jwt_decode(this.auth.auth.getToken());
      const cur = new Date().getTime() / 1000;
      return token.exp - cur;
    }

    return -1;
  }

  get isRep() {
    if (!this.data || !this.data.userRoles) return false;
    // return this.data.userRoles.find(ur => ur.role && (ur.role.name === 'Rep')) !== undefined;
    return this.data.userRoles.roleId === 2;
  }

  get isAdmin() {
    if (!this.data || !this.data.userRoles) return false;
    // return this.data.userRoles.find(ur => ur.role && (ur.role.name === 'Admin')) !== undefined;
    return this.data.userRoles.roleId === 1;
  }

  get hasWatchedTutorial() {
    return (
      this.data &&
      this.data.onboardingState &&
      this.data.onboardingState.currentStepId >= 3 &&
      this.data.onboardingState.currentStepId < 7
    );
  }

  get hasUploadedInitialClips() {
    return (
      this.data &&
      this.data.onboardingState &&
      this.data.onboardingState.currentStepId >= 4 &&
      this.data.onboardingState.currentStepId < 7
    );
  }

  get isVerified() {
    return (
      this.data &&
      this.data.onboardingState &&
      this.data.onboardingState.currentStepId >= 5 &&
      this.data.onboardingState.currentStepId < 7
    );
  }

  get hasSignedContract() {
    return (
      this.data &&
      this.data.onboardingState &&
      this.data.onboardingState.currentStepId >= 6 &&
      this.data.onboardingState.currentStepId < 7
    );
  }

  get data() {
    if (!this.dataField) {
      if ("localStorage" in window && window["localStorage"] !== null) {
        this.dataField = JSON.parse(localStorage.getItem("clippnUser"));
      } else if (
        "sessionStorage" in window &&
        window["sessionStorage"] !== null
      ) {
        this.dataField = JSON.parse(sessionStorage.getItem("clippnUser"));
      }
    }

    return this.dataField;
  }
  set data(value) {
    if ("localStorage" in window && window["localStorage"] !== null) {
      localStorage.setItem("clippnUser", JSON.stringify(value));
    } else if (
      "sessionStorage" in window &&
      window["sessionStorage"] !== null
    ) {
      sessionStorage.setItem("clippnUser", JSON.stringify(value));
    }

    this.dataField = value;
  }

  @computedFrom("data")
  get repContributors() {
    return this.data ? this.data.repContributors : [];
  }

  clearStoredData() {
    if ("localStorage" in window && window["localStorage"] !== null) {
      localStorage.removeItem("clippnUser");
    } else if (
      "sessionStorage" in window &&
      window["sessionStorage"] !== null
    ) {
      sessionStorage.removeItem("clippnUser");
    }

    this.dataField = undefined;
  }

  ensureInitialized() {
    if (!this.initialized && this.timeUntilTokenExpiration > 0) {
      return this.setLoggedIn().then(() => (this.initialized = true));
    }

    return Promise.resolve();
  }

  ensureTokenIsFresh() {
    const timeTilExpiration = this.timeUntilTokenExpiration;
    if (timeTilExpiration > 0 && timeTilExpiration <= 900)
      return this.refreshToken();

    return Promise.resolve();
  }

  refreshToken() {
    return this.httpClient
      .fetch(config.accountsApiUrls.refreshTokenUrl, {
        mode: "cors",
        method: "post",
        body: json({
          token: this.auth.auth.getToken()
        })
      })
      .then(resp => {
        if (resp.ok) {
          resp.json().then(token => {
            this.auth.auth.setToken(token, true);
          });
        }
      });
  }

  setLoggedIn() {
    return this.httpClient
      .fetch(config.accountsApiUrls.userDataFetchUrl, {
        mode: "cors",
        method: "get"
      })
      .then(resp => {
        console.log("Getting data");
        this.loggedIn = true;
        var promise = resp.ok
          ? resp.json().then(data => {
              this.data = data;
            })
          : Promise.resolve();
        return promise.then(() => {
          this.eventAggregator.publish("login", this.data);
          // set token to refresh every 30 minutes while logged in
          if (!this.rememberMe) setInterval(() => this.refreshToken(), 1800000);
        });
      });
  }

  updateData(data) {
    this.data = data;
  }

  login(user) {
    this.data = user;
    return this.setLoggedIn();
  }

  logout() {
    this.loggedIn = false;
    this.clearStoredData();
    this.auth.logout();
  }
}

@inject(User)
export class AuthorizeStep {
  constructor(user) {
    this.user = user;
  }
  run(navigationInstruction, next) {
    return this.user.ensureInitialized().then(() => {
      if (navigationInstruction.getAllInstructions().some(i => i.config.auth)) {
        if (!this.user.loggedIn) {
          return next.cancel(new Redirect("login"));
        }
      }
      return next();
    });
  }
}

@inject(User)
export class OnboardStep {
  constructor(user) {
    this.user = user;
  }

  run(navigationInstruction, next) {
    // if we're headed to the login, register, or verify page, just go to the page
    if (
      navigationInstruction.fragment.startsWith("/login") ||
      navigationInstruction.fragment.startsWith("/register") ||
      navigationInstruction.fragment.startsWith("/verify") ||
      navigationInstruction.fragment.startsWith("/forgot-password") ||
      navigationInstruction.fragment.startsWith("/reset-password") ||
      navigationInstruction.fragment.startsWith("/verify-corporate") ||
      navigationInstruction.fragment.startsWith("/privacy") ||
      navigationInstruction.fragment.startsWith("/terms-of-use") 
    )
      return next();
    if (!subdomainIsCorporate()) {
      // if the user is not verified, go to the initial upload page
      if (!this.user.hasUploadedInitialClips || !this.user.isVerified)
        return navigationInstruction.fragment !== "/initial-upload"
          ? next.cancel(new Redirect("initial-upload"))
          : next();

      // if the user has not signed the contract, go to the profile completion page
      if (!this.user.hasSignedContract)
        return navigationInstruction.fragment !== "/profile-completion"
          ? next.cancel(new Redirect("profile-completion"))
          : next();
    }

    return next();
  }
}
