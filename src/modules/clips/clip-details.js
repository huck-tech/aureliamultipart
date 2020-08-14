import {bindable, inject, computedFrom} from 'aurelia-framework';

export class ClipDetails {
    
    @bindable data;

    attached() {
        $('#clipDetailsModal').on('hidden.bs.modal', () => {
            $('#clipPlayer')[0].pause();
        });
    }
}