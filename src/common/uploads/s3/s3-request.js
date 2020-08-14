// import { inject } from "aurelia-framework";
import {json} from 'aurelia-fetch-client';
import { subdomainIsCorporate } from "main";
import config from 'app-config';

export class S3Request {

    static nextLogId = 0;

    constructor(config, signingHeaders, fileName, method, queryParams, contentType, progressCallback, body, ids) {
        this.config = config;
        this.signingHeaders = signingHeaders;
        this.fileName = fileName;
        this.method = method;
        this.queryParams = queryParams;
        this.contentType = contentType;
        this.progressCallback = progressCallback;
        this.body = body;
        this.ids = ids;
        this.package_id = this.ids.package_id;
        this.user_id = this.ids.user_id;
        this.timestamp = this.ids.timestamp;
        this.date = new Date().toUTCString();
        this.headers = {};
        this.headers['x-amz-date'] = this.date;

        if (this.contentType) {
            this.headers['Content-Type'] = this.contentType;                                                                        
        }
    }

    get signingUrl() {
        console.log('signing date', this.date)
        let stringToSign = `${this.method}\n\n${(this.contentType || '')}\n\nx-amz-date:${this.date}\n${this.relativeUrl}`;
        stringToSign = encodeURIComponent(stringToSign);
        return `${this.config.signerUrl}?to_sign=${stringToSign}`;
    }

    get relativeUrl() {
        let folder = this.package_id.toString() + this.user_id.toString() + '-' + this.timestamp
        let bucket = config.s3.bucket + folder;

        return this._relativeUrl || (this._relativeUrl = `/${bucket}/${encodeURIComponent(this.fileName)}${(this.queryParams ? `?${this.queryParams}` : '')}`);
        // return this._relativeUrl || (this._relativeUrl = `${encodeURIComponent(this.fileName)}`);
    }
    _relativeUrl = null;

    get absoluteUrl() {
        return this._absoluteUrl || (this._absoluteUrl = this.combineUrlParts(`${this.config.baseUrl}`, this.relativeUrl));
    }
    _absoluteUrl = null;

    combineUrlParts(part1, part2) {
        return `${part1}${(part1.endsWith('/') ? '' : '/')}${(part2.startsWith('/') ? part2.substr(1, part2.length - 1) : part2)}`;
    }

    send() {
        // return this.authorizeRequest().then(() => {
        //     console.log("Inside then part:");
        //     this.xhrToPromise(this.method, this.absoluteUrl, this.headers);
        //     console.log("xhrToPromise Done");
        // });
        return this.authorizeRequest().then(() => this.xhrToPromise(this.method, this.absoluteUrl, this.headers));
    }

    abort() {
        if (this.xhr) {
            this.xhr.abort();
        }
    }

    authorizeRequest() {
        return this.xhrToPromise('GET', this.signingUrl, this.signingHeaders).then(xhr => {
            // console.log("Getting promise: "+xhr);
            const signature = xhr.response.replace(/['"]+/g, '');
            this.headers.Authorization = `AWS ${this.config.accessKey}:${signature}`;
        });
    }

    xhrToPromise(method, url, headers) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.logId = S3Request.nextLogId++;

            //console.log("Promise before open");
            xhr.open(method, url, true);
            //console.log("Promise after open");
            // add headers
            for (let header in headers) {
                if (headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, headers[header]);
                }
            }

            xhr.addEventListener('loadstart', () => {
                this.logXhrEvent('loadstart');
            });

            // handle success by resolving promise and failure by rejecting it
            xhr.addEventListener('load', () => {
                this.logXhrEvent('load');
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr);
                } else {
                    reject(xhr);
                }
            });

            // reject promise on error
            xhr.addEventListener('error', () => {
                this.logXhrEvent('error');
                reject(xhr);
            });

            let loggedProgress = false;

            // handle progress, if provided
            if (this.progressCallback) {
                xhr.upload.addEventListener('progress', progressData => {
                    if (!loggedProgress && progressData.loaded && progressData.loaded > 0) {
                        this.logXhrEvent('progress');
                        loggedProgress = true;
                    }
                    this.progressCallback(progressData);
                });
            }

            this.xhr = xhr;

            this.logXhrEvent('send');
            xhr.send(this.body);
            //console.log("After xhr send:"+xhr);
        });
    }

    logXhrEvent(evtName) {
        if (this.config.xhrLogging) {
            //console.log(`(XHR #${this.xhr.logId}) [${new Date().getTime()}]: ${evtName}`);
        }
    }

    toString() {
        // get body as text, if possible
        let body = '';
        if (typeof this.body === 'string') {
            body = this.body;
        } else if (typeof this.body === 'object') {
            body = JSON.stringify(this.body);
        } else if (this.body) {
            body = this.body.toString();
        }

        return `${this.method} ${this.absoluteUrl}\n\r` +
            `Headers: ${this.headersToText(this.headers)}\n\r` +
            `Signing Url: ${this.signingUrl}\n\r` +
            `Signing Headers: ${this.headersToText(this.signingHeaders)}\n\r` +
            `Body: ${body}`;
    }

    headersToText(headers) {
        let text = '';
        for (let header in headers) {
            if (headers.hasOwnProperty(header)) {
                text += `${header}: ${headers[header]}`;
            }
        }
        return text;
    }
}