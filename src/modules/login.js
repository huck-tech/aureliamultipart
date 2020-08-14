import {inject, bindable} from 'aurelia-framework';
import {AuthService} from 'aurelia-auth';
import {Router} from 'aurelia-router';
import {User} from '../user';
import config from 'app-config';
import { subdomainIsCorporate } from "main";

@inject(AuthService, Router, User, config)
export class Login {
    
    @bindable userName = '';
    @bindable password = '';
    @bindable registrationUrl;
    @bindable subdomainIsCorporate = subdomainIsCorporate();

    @bindable loggingIn = false;
    @bindable errorMsg = null;

    constructor(auth, router, user, config) {
        this.auth = auth;
        this.router = router;
        this.user = user;
        this.config = config;
        this.registrationUrl = this.getRegistrationUrl();
    }

    getRegistrationUrl() {
        // let url = 'http://www.clippn.com/become-a-contributor-today/';
        let url = config.auth.registrationUrl;
        // if (this.config && this.config.partners) {
        //     const partnerName = window.location.hostname.replace('.clippn.com', '').replace('beta-', '');
        //     if (partnerName && partnerName !== 'dashboard' && this.config.partners[partnerName] && this.config.partners[partnerName].registrationUrl) {
        //         url = this.config.partners[partnerName].registrationUrl;
        //     }
        // }

        return url;
    }

    getToken() {
        if (!this.userName || !this.password) return;

        this.loggingIn = true;
        this.errorMsg = null;

        this.auth.login({
                email_id: this.userName,
                password: this.password,
                rememberMe: this.user.rememberMe,
                subdomain: 'Dashboard'
            })
            .then(response => {
                this.user.login(response.user).then(() => {
                    this.router.navigate('dashboard');
                });
            })
            .catch(err => {
                this.loggingIn = false;
                if (err.status && err.status === 400)
                    this.errorMsg = 'Invalid email address or password.';
                else
                    this.errorMsg = 'An unexpected error occurred. If the problem persists, please contact Clippn.';
            });
    }

    handleKeyPress(e) {
        const keyCode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keyCode === 13){
            console.log("Pressed enter on login page");
            this.getToken();
        }
        return true;
    }
}