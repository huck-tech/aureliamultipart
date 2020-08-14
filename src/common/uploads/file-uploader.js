import {inject, LogManager} from 'aurelia-framework';

import {EventObject} from 'common/event-object';
import {S3UploadManager} from './s3/s3-upload-manager';

@inject(LogManager, S3UploadManager)
export class FileUploader extends EventObject {

    progressHandler = null;
    completionHandler = null;
    retryHandler = null;
    errorHandler = null;
    fileUpload = null;
    retryAttempts = 0;
    lastReportedProgress = 0;

    constructor(logManager, uploadManager, path, file) {
        super();
        this.logManager = logManager;
        this.uploadManager = uploadManager;
        this.path = path;
        this.file = file;
        this.logger = logManager.getLogger('FileUploader');
    }

    start(ids, isFolder) {
        let package_id = '';
        if (isFolder !== true) {
            package_id = ids.package_id
        }
        // create upload
        const upload = this.uploadManager.createUpload(package_id + this.path, this.file, ids);

        // listen to events
        upload.addEventListener('progress', obj => this.dispatchEvent('progress', obj));
        upload.addEventListener('completed', obj => this.dispatchEvent('completed', obj));
        upload.addEventListener('failed', obj => this.dispatchEvent('failed', obj));
            
        // queue the upload
        this.uploadManager.queueUpload(upload, ids);
    }

    retry(ids, isFolder) {
        this.logger.info(`Manually retrying upload of ${this.path}...`);
        this.retryAttempts = 0;
        this.lastReportedProgress = 0;

        this.start(ids, isFolder);
    }
}