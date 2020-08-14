import {inject, bindable, computedFrom} from 'aurelia-framework';
import {HttpClient, json} from 'aurelia-fetch-client';
import config from 'app-config';
import {BindingEngine} from 'aurelia-binding';

import {User} from 'user';
import {AssetUploader} from 'common/uploads/asset-uploader';
import {Factory} from 'helpers/factory';
import {UploadManager} from 'common/uploads/upload-manager';

@inject(HttpClient, config, BindingEngine, User, Factory.of(AssetUploader), UploadManager)
export class UploadPackageDetails {
    @bindable isLoading = true;
    @bindable loadFailed = false;
    @bindable packageId;
    @bindable data;

    constructor(httpClient, config, bindingEngine, user, assetUploaderFactory, uploadManager) {
        this.httpClient = httpClient;
        this.config = config;
        this.uploadManager = uploadManager;

        //this.dataSubscription = bindingEngine.propertyObserver(this, 'packageId').subscribe(() => this.load());

        this.user = user;
        this.assetUploaderFactory = assetUploaderFactory;
    }

    @computedFrom('data')
    get canBeCompleted() {
        return this.packageId && this.data && this.data.clips && this.data.clips.every(c => c.status.name === 'Ready') && this.data.status && this.data.status.name !== 'Ready';
    }

    //@computedFrom('data')
    //get isMissingMamData() {
    //    return this.data && (!this.data.assetManagerId || this.data.assetManagerId === '' || (this.data.clips && this.data.clips.some(c => !c.assetId || c.AssetId === '')));
    //}

    packageIdChanged() {
        if (this.packageId) {
            this.load();
        }
    }

    load() {
        this.isLoading = true;
        this.loadFailed = false;

        return this.httpClient.fetch(`/uploads/${this.packageId}`, {
            mode: 'cors',
            method: 'get'
        }).then(resp => {
            if (resp.ok) {
                return resp.json().then(data => {
                    this.data = data;

                    this.data.clips.forEach(c => {
                        c.isExpanded = false;
                        c.areGeneratedClipsLoaded = false;
                        if (c.status)
                            this.setFileStatusDetails(c.status);
                    });

                    this.data.releases.forEach(r => {
                        if (r.status)
                            this.setFileStatusDetails(r.status);
                    });
                    this.isLoading = false;
                });
            } else {
                this.isLoading = false;
                this.loadFailed = true;
            }
        },
        () => {
            this.loading = false;
            this.loadFailed = true;
        });
    }

    setFileStatusDetails(status) {
        switch (status.name) {
            case 'PendingUpload':
            case 'Uploading':
            case 'Ingesting':
                status.iconName = 'upload';
                status.displayName = 'Uploading';
                break;
            case 'UploadFailed':
            case 'IngestFailed':
                status.iconName = 'exclamation-triangle';
                status.displayName = 'Failed';
                break;
            case 'Ready':
            case 'Processed':
                status.iconName = 'check';
                status.displayName = status.name;
                break;
        }
    }

    expandClip(clip) {
        clip.isExpanded = true;

        if (!clip.areGeneratedClipsLoaded)
            this.loadGeneratedClips(clip);
    }

    collapseClip(clip) {
        clip.isExpanded = false;
    }

    loadGeneratedClips(clip) {
        // call to get generated clips
        this.httpClient.fetch(`/uploads/clips/${clip.id}/generated`, {
            mode: 'cors',
            method: 'get'
        }).then(resp => {
            if (resp.ok) {
                return resp.json().then(gc => {
                    // replace empty generated clips with populated objects
                    for (let i = 0; i < gc.length; i++) {
                        const generatedClip = gc[i];
                        this.setGeneratedClipStatusDetails(generatedClip.status);
                        clip.generatedClips[i] = generatedClip;
                    }

                    // set flag indicating generated clips have now been loaded
                    clip.areGeneratedClipsLoaded = true;
                });
            }
        });
    }

    setGeneratedClipStatusDetails(status) {
        if (this.config.dalet.processingStatuses.indexOf(status.name) >= 0) {
            status.displayValue = 'Processing';
            status.iconName = 'upload';
        } else if (this.config.dalet.readyStatuses.indexOf(status.name) >= 0) {
            status.displayValue = 'Ready';
            status.iconName = 'check';
        } else if (this.config.dalet.failedStatuses.indexOf(status.name) >= 0) {
            status.displayValue = 'Failed';
            status.iconName = 'exclamation-triangle';
        }
    }

    repairPackage() {
        if (this.user.isAdmin) {
            this.isLoading = true;
            this.httpClient.fetch(`/uploads/${this.packageId}/repair`, {
                method: 'put',
                mode: 'cors'
            }).then(resp => {
                if (resp.ok) {
                    this.load();
                }
            });
        }
    }

    failPackage() {
        this.updatePackage({ uploadFailed: true });
    }

    updatePackage(updateObj) {
        if (this.user.isAdmin) {
            this.httpClient.fetch(`/uploads/${this.packageId}`, {
                method: 'put',
                mode: 'cors',
                body: json(updateObj)
            }).then(resp => {
                if (resp.ok) {
                    this.load();
                }
            });
        }
    }

    retryAssetUpload(clip) {
        const fileSelector = $('#retryFileSelector_' + clip.id)[0];
        const files = fileSelector.files;
        if (files && files.length === 1) {
            const file = files[0];
            // check to ensure the user selected the same file
            if (file.name.substr(0, file.name.lastIndexOf('.')) !== clip.fileName) {
                this.retryMessage = 'File name does match original file. Please upload the same file again.';
                $('#retryMessageModal').modal('show');
            } else {
                file.uploadName = clip.path;

                // create uploader from clip
                const assetUploader = this.assetUploaderFactory(clip.fileName, [file], false);
                assetUploader.id = clip.id;

                this.isLoading = true;

                // create asset uploader
                assetUploader.upload().then(() => this.load());

                // add the asset to the upload manager to track progress
                this.uploadManager.addAsset(assetUploader);
            }
        }

        // clear file selector
        fileSelector.value = '';
    }

    markPackageCompleted() {
        this.httpClient.fetch(`/uploads/${this.data.id}`, {
            method: 'put',
            mode: 'cors',
            body: json({ uploadFinished: true })
        }).then(() => {
            this.load();
        });
    }
}