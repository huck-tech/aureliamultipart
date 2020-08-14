import {bootstrap} from 'bootstrap';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {User, AuthorizeStep, OnboardStep} from './user';
import {FetchConfig} from 'aurelia-auth';
import {HttpClient} from 'aurelia-fetch-client';
import ScrollReveal from 'scrollreveal';
import config from 'app-config';

@inject(AuthorizeStep, User, FetchConfig, HttpClient, ScrollReveal, EventAggregator, OnboardStep)
export class App {
    constructor(authStep, user, fetchConfig, httpClient, scrollReveal, eventAggregator, onboardStep) {
        this.authStep = authStep;
        this.onboardStep = onboardStep;
        this.user = user;
        this.eventAggregator = eventAggregator;

        fetchConfig.configure();

        httpClient.configure(cfg => cfg.withBaseUrl(config.apiUrl));
        window.sr = scrollReveal;
    }

    configureRouter(config, router) {
        config.title = 'Clippn';
        config.addPipelineStep('authorize', this.authStep);
        config.addPipelineStep('authorize', this.onboardStep);
        config.map([
            { route: 'register', name: 'register', moduleId: 'modules/register', nav: false, title: 'Register', auth: false },
            { route: 'verify', name: 'verify', moduleId: 'modules/verify', nav: false, title: 'Verify' },
            { route: 'verify-corporate', name: 'verify-corporate', moduleId: 'modules/verify-corporate', nav: false, title: 'Verify' },            
            { route: 'verify-again', name: 'verify-again', moduleId: 'modules/verify-again', nav: false, title: 'Verify-Again' },
            { route: 'login', name: 'login', moduleId: 'modules/login', nav: false, title: 'Login', auth: false },
            { route: 'terms-of-use', name: 'terms-of-use', moduleId: 'modules/terms-of-use', nav: false, title: 'Terms of Use' },   
            { route: 'privacy', name: 'privacy', moduleId: 'modules/privacy', nav: false, title: 'Privacy Policy' },               
            { route: 'forgot-password', name: 'forgot-password', moduleId: 'modules/forgot-password', nav: false, title: 'Forgot Password' },
            { route: 'reset-password', name: 'reset-password', moduleId: 'modules/reset-password', nav: false, title: 'Reset Password' },
            { route: 'initial-upload', name: 'initial-upload', moduleId: 'modules/initial-upload', nav: false, title: 'Welcome to Clippn!', auth: true},
            { route: 'awaiting-verification', name: 'awaiting-verification', moduleId: 'modules/awaiting-verification', nav: false, title: 'Awaiting Verification', auth: true },
            { route: 'profile-completion', name: 'profile-completion', moduleId: 'modules/profile-completion', nav: false, title: 'Contract & Profile', auth: true},
            { route: 'admin', name: 'admin', moduleId: 'modules/admin', nav: true, title:'Admin', auth: true},
            { route: 'add-contributor', name: 'add-contributor', moduleId: 'modules/add-contributor', nav: true, title:'Add Contributor', auth: true},                        
            { route: ['', 'dashboard'], name: 'dashboard', moduleId: 'modules/dashboard', nav: false, title: 'Dashboard', auth: false}
        ]);
    }
}