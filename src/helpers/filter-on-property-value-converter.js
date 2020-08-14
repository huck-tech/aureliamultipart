

export class FilterOnPropertyValueConverter {
    toView(value, prop, propValue) {
        return value.filter(x => x[prop] === propValue);
    }
}