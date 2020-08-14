import {inject, customAttribute} from 'aurelia-framework';
import {datepicker} from 'jqueryui';

@customAttribute('date-picker')
@inject(Element)
export class DatePicker {  
    constructor(element) {
        this.element = element;
    }

    attached() {
        $(this.element).datepicker({ dateFormat: "yy-mm-dd", maxDate: 0 }).on('change', e => fireEvent(e.target, 'input'));
    }

    detached() {
        $(this.element).datepicker('destroy').off('change');
    }
}

function createEvent(name) {  
    const event = document.createEvent('Event');
    event.initEvent(name, true, true);
    return event;
}

function fireEvent(element, name) {  
    const event = createEvent(name);
    element.dispatchEvent(event);
}