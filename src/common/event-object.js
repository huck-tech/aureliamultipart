
export class EventObject {

    constructor() {
        this.events = {};
    }

    addEventListener(name, callback) {
        this.events[name] = this.events[name] || [];
        this.events[name].push(callback);
    }

    dispatchEvent(name, obj) {
        if (this.events[name]) {
            this.events[name].forEach(c => c(obj));
        }
    }
}