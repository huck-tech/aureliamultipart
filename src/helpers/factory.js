import {resolver} from 'aurelia-framework';

@resolver
export class Factory  {
    
    constructor(type) {
        this.type = type;
    }

    get(container) {
        var type = this.type;

        return function(...rest) {
            return container.invoke(type, rest);
        };
    }

    static of(type){
        return new Factory(type);
    }
}