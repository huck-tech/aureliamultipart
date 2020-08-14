import {bindable, inject, computedFrom} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import {User} from 'user';
import {UploadManager} from 'common/uploads/upload-manager';

@inject(HttpClient, UploadManager, User)
export class UtilityBar {
    
    @bindable router = Router;
    @bindable uploadManager = null;
    @bindable user = null;
    @bindable selectedUser = null;
    

    @bindable adminUsers = [];
    @bindable searchText = null;
    lastKeyUp = null;
    curSearchResp = null;

    constructor(httpClient, uploadManager, user) {
        this.httpClient = httpClient;
        this.uploadManager = uploadManager;
        this.user = user;
        
    }

    @computedFrom('user', 'adminUsers')
    get users() {
        // if (this.user.isRep) {
        //     console.log('isRep', this.user)
        //     return this.user.repContributors;
        // } else if (this.user.isAdmin) {
            // console.log('isAdmin', this.user)
            // return this.adminUsers;
        // } else {
            return [];
        // }

    }

    selectedUserChanged() {
        if (this.selectedUser) {
            this.user.selectedUser = this.selectedUser;
            $('#nowViewingDropdown').removeClass('open');
        }
    }

    setSelectedUser(contributor) {
        this.selectedUser = contributor;
        $('#nowViewingDropdown').removeClass('open');        
    }

    clearSelectedUser() {
        this.user.selectedUser = this.selectedUser = null;
        $('#nowViewingDropdown').removeClass('open');
    }

}