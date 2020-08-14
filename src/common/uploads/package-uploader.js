import { inject, bindable, computedFrom } from "aurelia-framework";
import { HttpClient, json } from "aurelia-fetch-client";
import { AssetUploader } from "./asset-uploader";
import { Factory } from "helpers/factory";
import { UploadManager } from "common/uploads/upload-manager";
import { User } from "user";
import moment from "moment-timezone";
import config from "app-config";

@inject(HttpClient, Factory.of(AssetUploader), config, User, UploadManager)
export class PackageUploader {
  id = null;
  user_id = null;
  timestamp = moment.tz("Europe/London").format("YYYYMMDDHHmmss");
  counter = 0;
  ids = null;

  @bindable name = null;
  @bindable description = null;
  @bindable city = null;
  @bindable stateOrProvince = null;
  @bindable country = null;
  @bindable dateShot = null;
  @bindable notes = null;
  @bindable owner = null;
  @bindable uploadNames = [];
  @bindable uploadSuccesses = [];
  @bindable uploadFailures = [];

  @bindable isFolder;
  @bindable assetUploaders = [];

  isInitialUpload = false;
  ingestStarted = false;

  constructor(httpClient, assetUploaderFactory, config, user, uploadManager) {
    this.httpClient = httpClient;
    this.assetUploaderFactory = assetUploaderFactory;
    this.config = config;
    this.user = user;
    this.subFolderName = this.user.data.id + "-" + this.timestamp;
    this.uploadManager = uploadManager;
  }

  get isUploading() {
    return this.uploadStarted && this.assetUploaders.some(f => f.isUploading);
  }

  get hasFailures() {
    return this.uploadStarted && this.assetUploaders.some(f => f.hasFailures);
  }

  get uploadsInProgress() {
    return this.assetUploaders.filter(f => f.isUploading).length;
  }

  get uploadsFailed() {
    return this.assetUploaders.filter(f => f.hasFailures).length;
  }

  get uploadedBytes() {
    return this.assetUploaders.reduce(
      (sum, uploader) => sum + uploader.uploaded,
      0
    );
  }

  get totalBytes() {
    return this.assetUploaders.reduce(
      (sum, uploader) => sum + uploader.size,
      0
    );
  }

  addAssetUploaders(assetUploaders) {
    assetUploaders.forEach(assetUploader =>
      this.addAssetUploader(assetUploader)
    );
  }

  addAsset(files, isRelease, isFolder, isDragged, path) {
    // ensure we've been given a file
    if (!files) return;
    let displayName;
    if (isFolder && !isDragged) {
      this.isFolder = "True";
      displayName = files.name;
      files.uploadName = files.webkitRelativePath.split(" ").join("_");
      this.uploadNames.push(files.uploadName);
    } else if (isFolder && isDragged) {
      this.isFolder = "True";
      displayName = files.name;
      files.path = path + files.name;
      files.uploadName = files.path.split(" ").join("_");
      this.uploadNames.push(files.uploadName);
    } else {
      this.isFolder = "False";
      displayName =
        files.displayName ||
        files[0].name.substr(0, files[0].name.lastIndexOf("."));
      if (!Array.isArray(files)) {
        files = files.files;
      }
      files.forEach(f => {
        f.uploadName = `${this.subFolderName}-${f.name}`.split(" ").join("_");
        this.uploadNames.push(f.uploadName);
        files = f;
      });
    }
    // create and add asset upload object
    this.addAssetUploader(
      this.assetUploaderFactory(displayName, files, isRelease, isFolder)
    );
  }

  addAssetUploader(assetUploader) {
    // add handlers for upload completion and failures
    assetUploader.addEventListener("completed", () =>
      this.handleAssetUploadCompletion()
    );
    assetUploader.addEventListener("failed", () =>
      this.handleAssetUploadCompletion()
    );

    // add file to the array
    this.assetUploaders.push(assetUploader);
  }

  removeAsset(assetUploader) {
    this.assetUploaders.splice(this.assetUploaders.indexOf(assetUploader), 1);
  }
  pushSuccess = f => {
    console.log("success", f);
    this.uploadSuccesses.push(f.uploads[0].path);
  };
  pushFailure = f => {
    console.log("failure", f);
    this.uploadFailures.push(f.uploads[0].path);
  };
  handleAssetUploadCompletion() {
    console.log("COMPLETED");
    const assetsStillUploading = this.assetUploaders.some(f => f.isUploading);
    // this.assetUploaders.map(
    //   f =>
    //     f.hasFailures
    //       ? (this.isFolder === 'True' ? this.uploadFailures.push(f.uploads[0].path) : this.uploadFailures.push(this.id + "-" + f.uploads[0].path))
    //       : (this.isFolder === 'True' ? this.uploadSuccesses.push(f.uploads[0].path) : this.uploadSuccesses.push(this.id + "-" + f.uploads[0].path))
    // );

    if (!assetsStillUploading && !this.ingestStarted) {
      this.assetUploaders.map(
        f => (f.hasFailures ? this.pushFailure(f) : this.pushSuccess(f))
      );
      console.log("successes", this.uploadSuccesses);
      console.log("failures", this.uploadFailures);
      this.ingestStarted = true;

      this.httpClient.fetch(config.packageApiUrls.packageUpdateUrl, {
        method: "put",
        mode: "cors",
        body: json({
          package_id: this.id,
          user_id: this.user_id,
          timestamp: this.timestamp,
          uploadRetry: "False",
          uploadFailed: "False",
          uploadFinished: "True",
          // uploadNames: this.uploadNames,
          uploadSuccesses: this.uploadSuccesses,
          uploadFailures: this.uploadFailures
        })
      });
      this.uploadManager.packageId = this.id;
      this.uploadManager.isUploaded = true;
      this.uploadManager.uploaded.push(this.id);
      this.uploadManager.successUploads = this.uploadSuccesses;
      this.uploadManager.failedUploads = this.uploadFailures;
    }
  }

  upload() {
    this.uploadStarted = true;
    const uploadObject = this.createUploadObject();
    console.log("hey");
    return this.httpClient
      .fetch(config.packageApiUrls.packageCreateUrl, {
        method: "post",
        mode: "cors",
        body: json(uploadObject)
      })
      .then(resp => {
        if (resp.ok) {
          return resp.json().then(packageData => {
            // set id from returned package
            this.id = packageData.id.toString();
            this.user_id = packageData.userId;
            let d = new Date(0);
            let utcSeconds = packageData.network_time;
            d.setUTCSeconds(utcSeconds);
            let networkTime = d.toUTCString();
            this.ids = {
              package_id: this.id.toString() + "-",
              user_id: this.user_id.toString(),
              timestamp: this.timestamp,
              network_time: ""
            };
            // initiate upload on each of the assets in the package
            // uploads are async, so they should happen in parallel
            if (this.assetUploaders && this.assetUploaders.length > 0) {
              this.assetUploaders.forEach(f => {
                // set the id on the file uploader
                if (!f.isRelease) {
                  const clip = packageData.clips.find(
                    c => c.asset_name === f.name
                  );
                  if (clip) {
                    f.id = clip.id;
                    f.uploads[0].file.uploadName = f.uploads[0].path;
                  }
                } else {
                  const release = packageData.releases.find(
                    r => r.asset_name === f.name
                  );
                  if (release) {
                    f.id = release.id;
                    f.uploads[0].file.uploadName = f.uploads[0].path;
                  }
                }
                // start upload
                f.upload(this.ids);
              });
            }
            return true;
          });
        } else {
          return Promise.resolve(false);
        }
      });
  }

  createUploadObject() {
    // const uid = new ShortUniqueId();
    // const fileAddendum = uid.randomUUID(6)
    const uploadObj = {
      package_name: this.name,
      package_description: this.description,
      city: this.city,
      state: this.stateOrProvince,
      country: this.country != null ? this.country.name : null,
      countryCode: this.country != null ? this.country.alpha2 : null,
      shot_date: this.dateShot,
      notes: this.notes,
      userId: this.owner ? this.owner.id : this.user.data.id,
      clips: [],
      releases: [],
      isForProspectiveContributor: this.isInitialUpload,
      uploadRetry: "False",
      uploadFailed: "False",
      uploadFinished: "False",
      timestamp: this.timestamp,
      uploadNames: this.uploadNames
    };

    for (let i = 0; i < this.assetUploaders.length; i++) {
      const assetUploader = this.assetUploaders[i];
      const uploadAsset = assetUploader.toUploadAsset();
      if (assetUploader.isRelease) uploadObj.releases.push(uploadAsset);
      else uploadObj.clips.push(uploadAsset);
    }

    return uploadObj;
  }

  clearErrors() {
    this.assetUploaders.forEach(f => f.clearErrors());
  }

  retry() {
    this.uploadStarted = true;
    this.ingestStarted = false;

    return this.httpClient
      .fetch(config.packageApiUrls.packageUpdateUrl, {
        method: "put",
        mode: "cors",
        body: json({
          package_id: this.id,
          user_id: this.user_id,
          timestamp: this.timestamp,
          uploadNames: this.uploadNames,
          uploadRetry: "True",
          uploadFailed: "True",
          uploadFinished: "False"
        })
      })
      .then(resp => {
        if (resp.ok) {
          return Promise.race(
            this.assetUploaders
              .filter(f => f.hasFailures)
              .map(f => f.retry(this.ids))
          );
        }
      });
  }
  networkTime = () => {
    return this.httpClient
      .fetch(config.packageApiUrls.networkTime, {
        method: "get",
        mode: "cors"
      })
      .then(resp => {
        if (resp.ok) {
          return resp.json().then(response => {
            console.log("RESPONSE", response);
            let d = new Date(0);
            let utcSeconds = response.time;
            d.setUTCSeconds(utcSeconds);
            let networkTime = d.toUTCString();
            return networkTime;
          });
        }
      });
  };
}
// retry() {
//     this.uploadStarted = true;
//     this.ingestStarted = false;

//     return Promise.race(this.assetUploaders.filter(f => f.hasFailures).map(f => f.retry()))

// }

// //     return this.httpClient.fetch(config.packageApiUrls.packageUpdateUrl, {
// //         method: 'put',
// //         mode: 'cors',
// //         body: json({
// //             package_id: this.id,
// //             user_id: this.user_id,
// //             timestamp: this.timestamp,
// //             uploadNames: this.uploadFailures,
// //             uploadRetry: "True",
// //             uploadFailed: "True",
// //             uploadFinished: "False"
// //         })
// //     }).then(resp => {
// //         if (resp.ok) {
// //             ;
// //         }
// //     });
// // }
// }
