import {inject} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {User} from 'user';
import config from 'app-config';

@inject(HttpClient, User)
export class ApiLogAppender {
    queue = [];

    constructor(httpClient, user) {
        this.httpClient = httpClient;
        this.user = user;

        setInterval(() => this.processQueue(), 1000);
    }

    processQueue() {

        if (this.queue.length > 0) {
           // create json from cur queue state
            const body = json(this.queue);

            // clear the queue
            this.queue.splice(0, this.queue.length);

            // send the logs to the server
            this.httpClient.fetch(config.apiUrl + 'accounts/v2/logging/', {
                mode: 'cors',
                method: 'post',
                body: body
            });
        }
    }

    debug(logger, ...rest) {
        if (!this.user.data) return;

        this.queue.push({
            userId: this.user.data.id,
            severity: 'Debug',
            localDateTime: new Date(),
            message: rest.join('\n\r')
        });
    }
    info(logger, ...rest) {
        if (!this.user.data) return;

        this.queue.push({
            userId: this.user.data.id,
            severity: 'Info',
            localDateTime: new Date(),
            message: rest.join('\n\r')
        });
    }
    warn(logger, ...rest) {
        if (!this.user.data) return;

        this.queue.push({
            userId: this.user.data.id,
            severity: 'Warn',
            localDateTime: new Date(),
            message: rest.join('\n\r')
        });
    }
    error(logger, ...rest) {
        if (!this.user.data) return;

        this.queue.push({
            userId: this.user.data.id,
            severity: 'Error',
            localDateTime: new Date(),
            message: rest.join('\n\r')
        });
    }
}