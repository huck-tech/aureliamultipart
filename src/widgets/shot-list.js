import {bindable, inject} from 'aurelia-framework';
import {ShotSuggestionManager} from 'common/shot-suggestion-manager';

@inject(ShotSuggestionManager)
export class ShotList {
    
    // @bindable divId;
    // @bindable shotSuggestionManager;

    constructor(shotSuggestionManager) {
        this.shotSuggestionManager = shotSuggestionManager;
    }
}