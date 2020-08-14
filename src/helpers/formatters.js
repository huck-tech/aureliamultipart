import moment from 'moment';

export class DateFormatValueConverter {
    toView(value, format) {
        return moment(value).utc().format(format);
    }
}

export class SizeInBytesValueConverter {

    toView(val) {
        if (!val)
            return null;

        if (val > 1000000000)
            return (Math.round(val / 10000000) / 100).toString() + ' GB';

        if (val > 1000000)
            return (Math.round(val / 10000) / 100).toString() + ' MB';

        if (val > 1000)
            return (Math.round(val / 10) / 100).toString() + ' KB';

        return val + ' B';
    }
}

export class CommaDelimitedListValueConverter {
    
    toView(val) {
        return val ? val.join() : '';
    }

    fromView(val) {
        return val ? val.split(',') : [];
    }
}

export class TimeInSecondsValueConverter {

    toView(val) {
        if (!val)
            return null;

        let display = '';
        let cur = val;

        const days = Math.floor(cur / (24 * 60 * 60));
        cur -= days * (24 * 60 * 60);
        if (days > 0) {
            display += `${days} day${days > 1 ? 's' : ''} `;
        }
        
        const hours = Math.floor(cur / (60 * 60));
        cur -= hours * (60 * 60);
        if (hours > 0) {
            display += `${hours} hr${hours > 1 ? 's' : ''} `;
        }
        
        const mins = Math.floor(cur / 60);
        cur -= mins * 60;
        if (mins > 0) {
            display += `${mins} min${mins > 1 ? 's' : ''} `;
        }

        const secs = Math.floor(cur);
        display += `${secs} sec${secs > 1 ? 's' : ''}`;

        return display;
    }
}