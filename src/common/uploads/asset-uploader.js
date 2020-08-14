import {inject, bindable, computedFrom} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import {EventAggregator} from 'aurelia-event-aggregator';

import {EventObject} from 'common/event-object';
import {Factory} from 'helpers/factory';
import {FileUploader} from './file-uploader';
import config from 'app-config';

@inject(HttpClient, EventAggregator, Factory.of(FileUploader))
export class AssetUploader extends EventObject {
    
    id = null;
    files = null;
    isRelease = false;
    uploads = [];
    
    @bindable name = null;
    @bindable displayName = null;
    @bindable size = 0;
    @bindable uploaded = 0;
    @bindable transferRate = 0;
    @bindable status = null;
    @bindable isUploading = false;
    @bindable hasFailures = false;

    progressLastReported;
    bytesLastReported;

    constructor(httpClient, eventAggregator, uploadFactory, displayName, files, isRelease, isFolder, id) {
        super();
        this.httpClient = httpClient;
        this.eventAggregator = eventAggregator;
        this.uploadFactory = uploadFactory;
        this.isFolder = isFolder;
        this.isRelease = isRelease;
        this.name = this.isFolder ? displayName : files.uploadName;
        this.displayName = displayName;
        this.size = files.size;
        
        this.progressLastReported = new Date();
        this.uploads.push(this.createUpload(this.setExtensionLowerCase(files.uploadName), files));
    }

    createUpload(path, file) {
        const upload = this.uploadFactory(path, file);
        upload.addEventListener('progress', progress => this.updateProgress(upload, progress));
        upload.addEventListener('completed', () => this.markUploadFinished(upload));
        upload.addEventListener('failed', err => this.markUploadFinished(upload, err));
        upload.completed = false;
        return upload;
    }

    updateProgress(upload, progress) {
        // store progress onto the upload
        upload.progress = progress;

        // calculate the new progress value by aggregating progress of all the uploads
        this.uploaded = this.uploads.reduce((cur, u) => cur + (u.progress && u.progress.loaded ? u.progress.loaded : 0), 0);

        // check if we haven't reported progress for at least 1 sec
        const now = new Date();
        if (now.getTime() - this.progressLastReported.getTime() < 1000)
            return;

        // set now as the last progress update
        this.progressLastReported = new Date();

        // update the transfer rate and uploaded values from the provided progress
        this.transferRate = this.uploaded - this.bytesLastReported;
        this.bytesLastReported = this.uploaded;

        // invoke any attached progress handlers
        this.dispatchEvent('progress', this);
    }

    markUploadFinished(upload, error) {
        // marked the upload finished and set the error (if any)
        upload.finished = true;
        upload.error = error;
        // check if all uploads are finished
        if (this.uploads.every(u => u.finished)) {
            // determine error or completion by checking if any of the uploads have an error
            if (this.uploads.some(u => !!u.error)) {
                this.handleError();
            } else {
                this.handleCompletion();
            }
        }
    }

    handleCompletion() {
        // set status and call server to mark upload complete and start ingest
        this.status = 'Completed';
        // create update object and optionally provide format id, if set
        const update = { uploadComplete: "True" };
        this.update(update)
            .then(resp => {
                if (resp.ok) {
                    // indicate uploading is done
                    this.isUploading = false;

                    // invoke any attached progress handlers
                    this.dispatchEvent('completed', this);

                    // allow any external listeners to know that an upload has completed
                    this.eventAggregator.publish('fileUploadCompleted', this);
                } else {
                    this.handleError(`Failed to update uploaded asset ${this.id} to completed. Response: [${resp.status}] ${resp.statusText} ${resp.responseText}`);
                }
            })
            .catch(err => {
                this.handleError(err);
            });
    }

    handleError(err) {
        // set status and call server to mark upload failed
        this.status = 'Failed';
        this.hasFailures = true;
        this.update({ uploadErrors: err || this.uploads.filter(u => !!u.error).map(u => u.error) })
            .then(() => {
                // invoke any attached progress handlers
                this.dispatchEvent('failed', this);

                // allow any external listeners to know that an upload has completed
                this.eventAggregator.publish('fileUploadFailed', this);
            });

        // indicate uploading is done
        this.isUploading = false;
    }

    clearErrors() {
        this.hasFailures = false;
    }

    upload(ids) {
        this.isUploading = true;

        // allow any external listeners to know that an upload has completed
        this.eventAggregator.publish('fileUploadStarted', this);

        // update on the server then start uploading to S3
        return this.update({ 
            uploadStarted: "True"
        }).then(() => this.uploads.forEach(u => u.start(ids, this.isFolder)));
    }

    retry(ids) {
        // clear any previous errors
        this.clearErrors();

        this.isUploading = true;

        // allow any external listeners to know that an upload has completed
        this.eventAggregator.publish('fileUploadRetrying', this);

        // update on the server then start uploading to S3
        return this.update(json({ uploadRetrying: "True" })).then(() => this.uploads.forEach(u => u.retry(ids, this.isFolder)));
    }

    update(updates) {
        updates.is_release = this.isRelease;
        updates.id = this.id;

        // console.log("Updating asset:"+updates.id);

        return this.httpClient.fetch(config.packageApiUrls.assetUpdateUrl, {
            method: 'put',
            mode: 'cors',
            body: json(updates)
        });
    }

    toUploadAsset() {
        return {
            // fileName: this.displayName,
            // path: this.name,
            // fileSize: this.size,
            // // formatId: this.formatId,
            // formatId: (this.formatId ? this.formatId : ''),
            // uploadStarted: "False",
            // uploadRetrying: "False",
            // uploadComplete: "False",
            // isRelease: this.isRelease

            asset_display_name: this.displayName,
            asset_name: this.name,
            asset_size: this.size,
            format_id:  '',
            uploadStarted: "False",
            uploadRetrying: "False",
            uploadComplete: "False",
            is_release: this.isRelease

        };
    }

    setExtensionLowerCase(path) {
        const lastDotIndex = path.lastIndexOf('.');
        if (lastDotIndex < path.length - 1) {
            const parts = path.split('.');
            const lastIndex = parts.length - 1;
            parts[lastIndex] = parts[lastIndex].toLocaleLowerCase();
            path = parts.join('.');
        }
        return path;
    }
}