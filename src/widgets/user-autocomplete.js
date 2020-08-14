import {inject, bindable} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

import {User} from 'user';

@inject(HttpClient, User)
export class UserAutocomplete {

    @bindable loader = null;
    @bindable selectedUser = null;

    constructor(httpClient, user) {
        this.httpClient = httpClient;
        this.user = user;

        this.loader = val => {
            return this.getUsers(val);
        };
    }

    getFullName(user) {
        return user.first_name + ' ' + user.last_name;
    }

    getUsers(val) {
        return this.httpClient.fetch(`user/v1/adminsearch/?search=${val}`).then(resp => {
            return resp.json().then(resObj => {
                console.log(resObj);
                // console.log(resObj.results);
                return resObj.results;
            });
        });
    }

    isMatch(rc, val) {
        return (rc.firstName && rc.firstName.indexOf(val) >= 0) ||
            (rc.lastName && rc.lastName.indexOf(val) >= 0) ||
            (rc.email && rc.email.indexOf(val) >= 0);
    }
}