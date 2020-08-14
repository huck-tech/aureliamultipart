import {bindable} from 'aurelia-framework';

export class BusyIndicator {
    @bindable isBusy;
    @bindable busyMessage;
    @bindable width;
    @bindable height;
}