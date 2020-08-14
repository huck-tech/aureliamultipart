import {Xhr} from 'common/xhr-helpers';
import {S3UploadPartStatuses} from './s3-upload-part-statuses';
import {S3Request} from './s3-request';

export class S3UploadPart {

    constructor(logManager, config, signingHeaders, name, file, uploadId, partNum, startIndex, endIndex, ids) {
        this.logManager = logManager;
        this.config = config;
        this.signingHeaders = signingHeaders;
        this.name = name;
        this.file = file;
        this.uploadId = uploadId;
        this.partNum = partNum;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.ids = ids;
        this.status = S3UploadPartStatuses.pending;
        this.attempts = 0;
        this.bytesUploaded = 0;

        this.logger = this.logManager.getLogger('S3UploadPart');
        this.failedXhrs = [];
    }

    get size() {
        return this.endIndex - this.startIndex;
    }

    get sliceFnName() {
        return this.file.slice ? 'slice' : (this.file.mozSlice ? 'mozSlice' : 'webkitSlice');
    }

    get bytesToUpload() {
        return this.file[this.sliceFnName](this.startIndex, this.endIndex);
    }

    get canRetry() {
        return this.attempts < this.config.maxAttemptsPerPart;
    }

    upload() {
        // increment the number of attempts made to upload the part
        this.attempts++;
        // reset state
        this.bytesUploaded = 0;
        this.status = S3UploadPartStatuses.inProgress;
        // create request
        this.request =
            new S3Request(this.config,
                this.signingHeaders,
                this.name,
                'PUT',
                `partNumber=${this.partNum}&uploadId=${this.uploadId}`,
                null,
                progressData => this.handleProgress(progressData),
                this.bytesToUpload,
                this.ids)

        // submit the request and resolve the promise when it completes or fails, returning
        // the part in the promise resolution
        return new Promise((resolve) => {
            this.request.send()
                .then(xhr => {
                    this.eTag = xhr.getResponseHeader('ETag');
                    this.logger.info(`Upload of part #${this.partNum} for ${this.name} returned an ETag of ${this.eTag}.`);
                    this.status = S3UploadPartStatuses.completed;
                })
                .catch(xhr => {
                    this.failedXhrs.push(xhr);
                    this.status = S3UploadPartStatuses.failed;
                })
                .then(() => resolve(this));
        });
    }

    handleProgress(progressData) {
        this.bytesUploaded = progressData.loaded;
    }

    abort() {
        if (this.request) {
            this.request.abort();
        }
    }

    getErrors() {
        return this.failedXhrs.map((xhr, i) => `Attempt #${i + 1}: ${Xhr.toText(xhr)}`).join('\n\r');
    }
}