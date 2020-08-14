import {EventObject} from 'common/event-object';
import {Xhr} from 'common/xhr-helpers';
import {S3UploadPartStatuses} from './s3-upload-part-statuses';
import {S3Request} from './s3-request';
import {S3UploadPart} from './s3-upload-part';

export class S3MultipartUpload extends EventObject {

    constructor(uploadManager, logManager, config, signingHeaders, name, file, ids) {
        super();
        this.uploadManager = uploadManager;
        this.logManager = logManager;
        this.config = config;
        this.signingHeaders = signingHeaders;
        this.name = name;
        this.file = file;
        this.curPartIndex = 0;
        this.parts = [];
        this.partsInProgress = [];
        this.ids = ids;
        this.logger = this.logManager.getLogger('S3MultipartUpload');
        this.events = {};
    }

    upload() {
        return this.initiate().then(() => this.uploadParts());
    }

    initiate() {
        return this.sendRequest('POST', 'uploads')
            .then(xhr => {
                // console.log("XHR Value:"+xhr.responseText);
                this.uploadId = xhr.response.match(/<UploadId\>(.+)<\/UploadId\>/)[1];
                this.logger.info(`Upload ID for ${this.name} is ${this.uploadId}.`);
            })
            .catch(xhr => {
                const errMsg = `Failed to initiate the multipart upload: ${Xhr.toText(xhr)}`;
                this.dispatchEvent('failed', errMsg);
                return Promise.reject(errMsg);
            });
    }

    uploadParts() {
        // calc the number of parts by dividing the file size by the part size and rounding up
        const numParts = Math.ceil(this.file.size / this.config.partSize) || 1;

        this.logger.info(`Upload for ${this.name} (${this.file.size} bytes) will be done in ${numParts} parts of ${this.config.partSize} bytes each.`);
        // create an upload part for each slice of the file
        for (let i = 0; i < numParts; i++) {
            this.parts.push(
                new S3UploadPart(this.logManager,
                    this.config,
                    this.signingHeaders,
                    this.name,
                    this.file,
                    this.uploadId,
                    i + 1,
                    i * this.config.partSize,
                    (i + 1) * this.config.partSize,
                    this.ids)
            );
        }

        // determine how many parts to start right away based on concurrency settings and the size of the file
        const initialPartCount = this.parts.length > this.config.concurrentParts ? this.config.concurrentParts : this.parts.length;

        // start the initial set of part uploads
        for (this.curPartIndex; this.curPartIndex < initialPartCount; this.curPartIndex++) {
            this.uploadPart();
        }

        this.logger.info(`Currently uploading ${this.curPartIndex} parts for ${this.name}.`);

        // start reporting progress every 1 second
        this.progressIntervalId = setInterval(() => {
            // calc total bytes uploaded
            const uploaded = this.parts.reduce((cur, p) => cur += p.bytesUploaded, 0);

            const progressObj = {
                loaded: uploaded,
                total: this.file.size,
                progress: uploaded / this.file.size
            };

            // dispatch progress event
            this.dispatchEvent('progress', progressObj);

        }, 1000);
    }

    uploadPart(part) {
        // if no part was provided, upload the current part
        if (!part) {
            part = this.parts[this.curPartIndex];
        }

        this.logger.info(`Starting upload of part #${part.partNum} of ${this.name}.`);

        // add the part to the collection of parts in progress
        this.partsInProgress.push(part);

        // start uploading
        this.uploadManager.queueUploadPart(part).then(p => this.handlePartFinished(p));
    }

    handlePartFinished(part) {
        this.logger.info(`Part #${part.partNum} of ${this.name} finished uploading with a status of ${part.status}.`);

        // remove the part from the in-progress collection and increment to the next part
        this.partsInProgress.splice(this.partsInProgress.indexOf(part), 1);
        
        this.logger.info(`Upload of ${this.name} currently has ${this.partsInProgress.length} parts in progress.`);

        switch (part.status) {
            case S3UploadPartStatuses.completed:
                this.logger.info(`Upload index for ${this.name} is now ${this.curPartIndex} of ${this.parts.length}`);

                if (this.curPartIndex < this.parts.length) {
                    this.logger.info(`${this.name} still has parts remaining. Uploading part ${this.curPartIndex} now.`);

                    // if any parts left, upload next
                    this.uploadPart();

                    // move to next part
                    this.curPartIndex++;
                } else if (this.partsInProgress.length === 0) {
                    clearInterval(this.progressIntervalId);

                    this.logger.info(`All parts of ${this.name} have completed successfully.`);

                    // send request to complete multipart upload
                    this.complete();
                }
                break;
            case S3UploadPartStatuses.failed:
                if (part.canRetry) {
                    this.logger.info(`Retrying part #${part.partNum} of ${this.name} (attempt #${part.attempts}).`);

                    // try to upload this part again
                    this.uploadPart(part);
                } else {
                    clearInterval(this.progressIntervalId);

                    this.logger.info(`Aborting upload because part #${part.partNum} of ${this.name} failed to upload after ${part.attempts} attempts.`);

                    // abort other parts in progress
                    this.partsInProgress.forEach(p => p.abort());

                    // send request to abort multipart upload
                    this.abort();

                    // raise failure event
                    this.dispatchEvent('failed', part.getErrors());
                }
                break;
        }
    }

    complete() {
        let completeXml = '<CompleteMultipartUpload>';
        completeXml += this.parts.reduce((agg, cur) => agg += `<Part><PartNumber>${cur.partNum}</PartNumber><ETag>${cur.eTag}</ETag></Part>`, '');
        completeXml += '</CompleteMultipartUpload>';
        // build completion xml
        // completeXml += this.parts.reduce((agg, cur) => agg += `<Part><PartNumber>${cur.partNum}</PartNumber><ETag>${cur.eTag}</ETag></Part>`, '');
        // completeXml += '</CompleteMultipartUpload>';
        this.logger.info(`Sending multipart upload completion XML for ${this.name}: ${completeXml}`);

        // post to complete the upload
        // console.log(completeXml);
        return this.sendRequest('POST', `uploadId=${this.uploadId}`, 'application/xml; charset=UTF-8', completeXml)
            .then(() => {
                this.logger.info(`Multipart upload for ${this.name} completed successfully.`);
                // raise completed event
                this.dispatchEvent('completed');
            })
            .catch(xhr => {
                // completion failed - let's try to abort now
                // this.abort();
                // raise failure event
                this.dispatchEvent('failed', `Failed to complete the multipart upload: ${Xhr.toText(xhr)}`);
            });
    }

    abort() {
        this.logger.info(`Sending delete to abort multipart upload for ${this.name}.`);
        return this.sendRequest('DELETE', `uploadId=${this.uploadId}`);
    }

    sendRequest(method, queryParams, contentType, body) {
        const req = new S3Request(this.config, this.signingHeaders, this.name, method, queryParams, contentType, null, body, this.ids);
        return req.send().catch(xhr => {
            // log the state of the XHR
            this.logger.error(`An error occurred sending request to S3:\n\r` + 
                `XHR Status: ${xhr.status}\n\r` +
                `Request: ${req.toString()}\n\r` +
                `Response: ${Xhr.toText(xhr)}`);

            // prevent any further execution
            throw xhr;
        });
    }
}