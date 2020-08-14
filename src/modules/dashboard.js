import {inject} from 'aurelia-framework';
import {activationStrategy} from 'aurelia-router';

export class Dashboard {
    
    configureRouter(config, router) {
        config.title = "Dashboard";
        config.map([
            { route: ['', 'home'], href: '#/dashboard/home', name: 'home', moduleId: 'modules/home', nav: false, title: 'Home', settings: { linkClass: '', fontClass: 'fa-tachometer' }, auth: true, activationStrategy: activationStrategy.invokeLifecycle },
            { route: 'uploads', href: '#/dashboard/uploads', name: 'uploads', moduleId: 'modules/uploads/uploads', nav: true, title: 'UPLOADS', settings: { linkClass: 'uploads', fontClass: 'fa-cloud-upload' }, auth: true },
            { route: 'clips', href: '#/dashboard/clips', name: 'clips', moduleId: 'modules/clips/clips', nav: true, title: 'CLIPS', settings: { linkClass: 'clips', fontClass: 'fa-film' }, auth: true },
            { route: 'contact', href: '#/dashboard/contact', name: 'contact', moduleId: 'modules/contact', title: 'Contact Us', auth: true},
            { route: 'feedback', href: '#/dashboard/feedback', name: 'feedback', moduleId: 'modules/feedback', nav: false, title: 'Feedback', auth: true },
            { route: 'sales', href: '#/dashboard/sales', name: 'sales', moduleId: 'modules/sales', nav: false, title: 'Sales', auth: true },
            { route: 'payments', href: '#/dashboard/payments', name: 'payments', moduleId: 'modules/payments', nav: false, title: 'Payments', auth: true },
            { route: 'user-profile', href: '#/dashboard/user-profile', name: 'user-profile', moduleId: 'modules/user-profile', nav: false, title: 'Profile', auth: true },
            { route: 'add-contributor', href: '#/dashboard/add-contributor', name: 'add-contributor', moduleId: 'modules/add-contributor', nav: true, settings: { linkClass: 'add-contributor', fontClass: 'fa-plus-square' }, title: 'ADD CONTRIBUTOR', auth: true },
            { route: 'faqs', href: '#/dashboard/faqs', name: 'faqs', moduleId: 'modules/faqs', nav: false, title: 'FAQs', auth: true },
            { route: 'privacy', href: '#/dashboard/privacy', name: 'privacy', moduleId: 'modules/privacy', nav: false, title: 'Privacy Policy', auth: false },
            { route: 'terms-of-use', href: '#/dashboard/terms-of-use', name: 'terms-of-use', moduleId: 'modules/terms-of-use', nav: false, title: 'Terms of Use', auth: false },            
            { route: 'admin', href: '#/dashboard/admin', name: 'admin', moduleId: 'modules/admin', nav: true, title: 'ADMIN', settings: { linkClass: 'admin', fontClass: 'fa-gears' }, auth: true },            
            { route: 'fc-upload', href: '#/dashboard/fc-upload', name: 'fcuploads', moduleId: 'modules/fc-upload', nav: false, title: 'File Catalyst Upload', auth: true }
        ]);

        this.router = router;
        this.router.baseUrl = 'dashboard';
    }
}