import {inject, bindable} from 'aurelia-framework';
import config from '../app-config';

@inject(config)
export class ClippnUniversity {

    constructor(config) {
        this.config = config;
    }

    attached() {
        $('#clippnUniversity').on('hidden.bs.modal', () => {
            $('#tutorialVideo')[0].pause();
        });
    }
}