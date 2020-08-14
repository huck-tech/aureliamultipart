import {inject, bindable} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {DialogService} from 'aurelia-dialog';
import {User} from 'user';
import { subdomainIsCorporate } from "main";

@inject(Router, DialogService, User)
export class NavBar {
    
    @bindable router = null;
    @bindable user = null;
    @bindable showingMobileMenu = false;
    @bindable subdomainIsCorporate = subdomainIsCorporate();
    @bindable isRep = true;
    @bindable isAdmin = true;
    
    constructor(router, dialogService, user) {
        this.router = router;
        this.dialogService = dialogService;
        this.user = user;
        this.isRep = user.dataField.userRoles.roleId == 2 ? true : false;
        this.isAdmin = this.user.isAdmin;
    }

    logout() {
        this.user.logout();
    }

    setMobileMenuVisibility(val) {
        this.showingMobileMenu = val;
    }

    setUser() {
        this.utilityBar.selectedUserChanged()
    }
    navigateTo(route) {
        this.showingMobileMenu = false;
        this.router.navigate(`#/dashboard/${route}`);
    }
}