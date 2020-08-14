import {inject} from 'aurelia-framework';
import {validationRenderer} from 'aurelia-validation';
//import $ from 'jquery';

@validationRenderer
@inject(Element)
export class LabelAdjacentValidationRenderer {
    constructor(boundaryElement) {
        this.boundaryElement = boundaryElement;
    }

    render(error, target) {
        if (!target || !(this.boundaryElement === target || this.boundaryElement.contains(target))) {
            return;
        }

        // tag the element so we know we rendered into it.
        target.errors = (target.errors || new Map());
        target.errors.set(error);

        // add help-block
        const message = document.createElement('span');
        message.classList.add('label-adjacent');
        message.classList.add('validation-error');
        message.textContent = error.message;
        message.error = error;
        
        $('label[for="' + target.id + '"]').after(message);
    }

    unrender(error, target) {
        if (!target || !target.errors || !target.errors.has(error)) {
            return;
        }

        target.errors.delete(error);

        $('label[for="' + target.id + '"]').next().remove();
    }
}

@validationRenderer
@inject(Element)
export class RegisterValidationRenderer {
    constructor(boundaryElement) {
        this.boundaryElement = boundaryElement;
    }

    render(error, target) {
        if (!target || !(this.boundaryElement === target || this.boundaryElement.contains(target))) {
            return;
        }

        // tag the element so we know we rendered into it.
        target.errors = (target.errors || new Map());
        target.errors.set(error);

        // add help-block
        const message = document.createElement('div');
        message.classList.add('validation-error');
        //message.style.marginLeft = '165px';
        message.textContent = `* ${error.message}`;
        message.error = error;
        
        $(target).parent().after(message);
    }

    unrender(error, target) {
        if (!target || !target.errors || !target.errors.has(error)) {
            return;
        }

        target.errors.delete(error);

        $(target).parent().next().remove();
    }
}
