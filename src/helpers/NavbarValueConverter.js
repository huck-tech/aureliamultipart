import {User} from 'user';
import {inject} from 'aurelia-framework';
import { subdomainIsCorporate } from 'main'

@inject(User)
export class NavbarValueConverter {
    constructor(user) {
        this.user = user;
    }
    toView(obj) {
        let nav = []
        self = this;
        obj.forEach(function(navitem) {
            if (navitem.config.name === 'admin') {
                if (self.user.isAdmin) {
                    nav.push(navitem)
                } else {
                    return null;
                }
            } else if (navitem.config.name === 'add-contributor') {
                if (self.user.isAdmin || self.user.isRep) {
                    if (subdomainIsCorporate()) {
                        nav.push(navitem);
                    }
                }
                else {
                    return null;
                }
            } else {
                nav.push(navitem);
            }
        })  
        return nav;      


    }
}