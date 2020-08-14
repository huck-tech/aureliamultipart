import { bindable, computedFrom, inject, NewInstance } from "aurelia-framework";
import { ValidationController } from "aurelia-validation";
import { ValidationRules } from "aurelia-validatejs";
import { HttpClient, json } from "aurelia-fetch-client";
import { Router } from "aurelia-router";

import { countries } from "country-data";
import $ from "jquery";
import { UploadManager } from "common/uploads/upload-manager";
import { PackageUploader } from "common/uploads/package-uploader";
import { S3UploadManager } from "common/uploads/s3/s3-upload-manager";
import { UploadConfirmation } from "prompts/upload-confirmation";
import { Factory } from "helpers/factory";
import { MultiStepModal } from "helpers/modals";
import { CameraFolderFileExtractor } from "common/uploads/Folders/camera-folder-file-extractor";
import { FileDropZone } from "widgets/file-drop-zone";
import { User } from "user";

@inject(
  HttpClient,
  UploadManager,
  Router,
  Factory.of(PackageUploader),
  MultiStepModal,
  NewInstance.of(ValidationController),
  countries,
  CameraFolderFileExtractor,
  Factory.of(FileDropZone),
  S3UploadManager,
  User
)
export class NewUploadPackage {
  @bindable name = null;
  @bindable description = null;
  @bindable city = null;
  @bindable stateOrProvince = null;
  @bindable country = null;
  @bindable dateShot = null;
  @bindable notes = null;

  @bindable packageUploader = null;
  @bindable expectCameraFolder = null;

  clipDropZone = null;
  releaseDropZone = null;
  @bindable isUploading = false;
  @bindable clipsErrorMessage = null;
  @bindable releasesErrorMessage = null;
  @bindable showUploadErrorMessage = false;

  @bindable isInitialUpload = false;
  @bindable clipLimit = 100000;

  @bindable isProxyUpload = false;
  @bindable owner = null;
  @bindable users = [];

  @bindable settings;
  @bindable cameraFolders = [];
  @bindable clips = [];

  constructor(
    httpClient,
    uploadManager,
    router,
    packageUploaderFactory,
    multiStepModal,
    validationController,
    countries,
    cameraFolderFileExtractor,
    fileDropZoneFactory,
    s3UploadManager,
    user
  ) {
    this.httpClient = httpClient;
    this.uploadManager = uploadManager;
    this.router = router;
    this.packageUploaderFactory = packageUploaderFactory;
    this.multiStepModal = multiStepModal;
    this.validationController = validationController;
    this.countries = countries;
    this.cameraFolderFileExtractor = cameraFolderFileExtractor;
    this.user = user;
    this.S3UploadManager = s3UploadManager;

    this.packageUploader = this.packageUploaderFactory();

    this.clipDropZone = fileDropZoneFactory();
    this.releaseDropZone = fileDropZoneFactory();
    this.counter = 0;
    this.counterArray = [];
  }

  @computedFrom("expectCameraFolder")
  get expectSingleClips() {
    if (this.expectCameraFolder === null) {
      return "off";
    }
    this.counter += 1;
    this.counterArray.push(this.counter);
    this.instantiateDropZone(this.expectCameraFolder === "on" ? "off" : "on");
    return this.expectCameraFolder === "on" ? "off" : "on";
  }
  set expectSingleClips(value) {
    this.expectCameraFolder = value === "on" ? "off" : "on";
    // this.instantiateDropZone('on')
  }

  @computedFrom("expectCameraFolder")
  get showFolderBrowse() {
    return this.expectCameraFolder === "on";
  }

  get supportsFolderBrowse() {
    const inputElt = document.createElement("input");
    return "webkitdirectory" in inputElt;
  }

  get sortedCountries() {
    let united_states = {
      alpha2: "US",
      alpha3: "USA",
      countryCallingCodes: ["+1"],
      currencies: ["USD"],
      emoji: "🇺🇸",
      ioc: "USA",
      languages: ["eng"],
      name: "United States",
      status: "assigned"
    };
    let country_array = this.countries.all
      .filter(c => c.status !== "reserved")
      .sort((c1, c2) => c1.name.localeCompare(c2.name));
    country_array.unshift(united_states);
    return country_array;
  }

  attached() {
    this.multiStepModal.initialize("myUpload");
    this.multiStepModal.addResetHandler(() => this.clear());
    this.multiStepModal.canGoToStep = (goTo, cur) =>
      this.canGoToStep(goTo, cur);

    this.clipsFileSelector = $("#uploadClipSelector")[0];
    this.releasesFileSelector = $("#uploadReleaseSelector")[0];

    $("#myUpload").on("show.bs.modal", evt => {
      if (evt.target && evt.target.id === "myUpload") {
        this.multiStepModal.reset();
      }
    });

    this.instantiateDropZone(null);

    this.releaseDropZone.attach("release-drop-zone", file =>
      this.addReleases([file])
    );

    this.packageUploader.isInitialUpload = this.isInitialUpload;
  }
  folderError = type => {
    if (type === "folders") {
      console.log("folders");
      this.clipsErrorMessage =
        "Please only upload camera folders with the camera folder selection. To upload clips, please be sure to only upload clip files, not folders.";
      console.log(this.clipsErrorMessage);
    } else if (type === "clips") {
      console.log("clips");
      this.clipsErrorMessage =
        "Be sure that when uploading only clips to do so using the clips button";
      console.log(this.clipsErrorMessage);
    } else if (type === "clips_already") {
      console.log("clips already");
      this.clipsErrorMessage =
        "Please remove your clips from the clips selector before uploading a folder";
      console.log(this.clipsErrorMessage);
    } else if (type === "folders_already") {
      console.log("folders already");
      this.clipsErrorMessage =
        "Please remove your folders from the folder selector before uploading a clip";
      console.log(this.clipsErrorMessage);
    }
  };
  instantiateDropZone(folderStatus) {
    this.clipDropZone.attach(
      "clip-drop-zone",
      folderStatus,
      (file, path, dragged) => this.addClips([file], path, dragged),
      this.folderError,
      this.counterArray,
      this.hasDirectory,
      this.cameraFolders,
      this.clips
    );
  }
  isProxyUploadChanged(val) {
    if (!val) {
      this.owner = null;
    }
  }

  addClipsFromFileSelector() {
    if (
      !this.clipsFileSelector ||
      !this.clipsFileSelector.files ||
      this.clipsFileSelector.files.length <= 0
    ) {
      return;
    }
    if (this.expectCameraFolder === "on") {
      if (this.clips.length > 0) {
        this.folderError("clips_already");
        return;
      }
      let directoryInfo = {
        name: null,
        size: 0,
        complete: false,
        fileNameList: []
      };

      for (let i = 0; i < this.clipsFileSelector.files.length; i++) {
        if (this.clipsFileSelector.files[i].name !== ".DS_Store") {
          directoryInfo.size =
            directoryInfo.size + this.clipsFileSelector.files[i].size;
          directoryInfo.fileNameList.push(this.clipsFileSelector.files[i].name);
          directoryInfo.name = this.clipsFileSelector.files[
            i
          ].webkitRelativePath.split("/")[0];
        }
      }
      this.cameraFolders.push(directoryInfo);
    }
    if (this.expectCameraFolder === "off") {
      if (this.cameraFolders.length > 0) {
        this.folderError("folders_already");
        return;
      }
    }
    this.addClips(this.clipsFileSelector.files);

    // clear file selector
    this.clipsFileSelector.value = "";
  }

  addClips(files, path, dragged) {
    let getFileExtension = filename => {
      return filename
        .split(".")
        .pop()
        .toLowerCase();
    };
    const acceptableClipsFileExtensions = [
      "mxf",
      "mov",
      "mp4",
      "mpg",
      "mpeg",
      "r3d",
      "mkv", 
      "avi",
      "mts",
      "m2ts"
    ];
    // clear any previous errors
    this.clipsErrorMessage = null;

    if (this.expectCameraFolder === "on") {
      // try to determine the folder type based on its contents
      // const folderType = this.cameraFolderFileExtractor.getFolderType(files);

      // if (!folderType)
      //   this.clipsErrorMessage =
      //     "The selected folder does not match a recognized camera folder structure.";
      // else {
      // folderType.getClips(files).forEach(c => {
      //   this.packageUploader.addAsset(c, false);
      // });
      for (let i = 0; i < files.length; i++) {
        let filename;
        if (dragged) {
          filename = (path + files[i].name).replace(/^.*[\\\/]/, "");
        } else {
          filename = files[i].webkitRelativePath.replace(/^.*[\\\/]/, "");
        }
        if (filename == ".DS_Store") {
        } else {
          this.packageUploader.addAsset(files[i], false, true, dragged, path);
        }
      }
      // }
    } else {
      // add files to package
      for (let i = 0; i < files.length; i++) {
        if (
          acceptableClipsFileExtensions.indexOf(
            getFileExtension(files[i].name)
          ) > -1
        ) {
          this.clips.push(files[i]);
          this.packageUploader.addAsset([files[i]], false, false, false);
        }
      }
    }

    // if we exceed the limit, alert the user
    if (this.packageUploader.assetUploaders.length > this.clipLimit)
      this.clipsErrorMessage = `Too many clips selected. Please limit the number of clips in the package to ${
        this.clipLimit
      }.`;
  }

  addReleasesFromFileSelector() {
    if (
      !this.releasesFileSelector ||
      !this.releasesFileSelector.files ||
      this.releasesFileSelector.files.length <= 0
    )
      return;

    this.addReleases(this.releasesFileSelector.files);

    // clear file selector
    this.releasesFileSelector.value = "";
  }

  addReleases(files) {
    this.releasesErrorMessage = null;

    let allPdfs = true;

    // add releases to package
    for (let i = 0; i < files.length; i++) {
      if (files[i].name.toLowerCase().endsWith("pdf"))
        this.packageUploader.addAsset([files[i]], true);
      else allPdfs = false;
    }

    if (!allPdfs)
      this.releasesErrorMessage =
        "Releases must be in PDF format. One or more of the files selected was not a PDF.";
  }
  sortArrayByNameLengthForAssets(arr) {
    function compare(a, b) {
      if (a.name.length < b.name.length) return -1;
      if (a.name.length > b.name.length) return 1;
      return 0;
    }
    return arr.sort(compare);
  }
  sortArrayByNameLengthForFolder(arr) {
    function compare(a, b) {
      if (a.length < b.length) return -1;
      if (a.length > b.length) return 1;
      return 0;
    }
    return arr.sort(compare);
  }

  removeFolder(folder) {
    let assets = this.packageUploader.assetUploaders;
    let fileList = this.sortArrayByNameLengthForFolder(folder.fileNameList);
    this.packageUploader.assetUploaders = this.sortArrayByNameLengthForAssets(
      this.packageUploader.assetUploaders
    );
    this.parseAndRemoveFolderAssets(fileList, folder);
  }
  parseAndRemoveFolderAssets(fileList, folder) {
    this.packageUploader.assetUploaders.forEach((asset, index) => {
      if (fileList.indexOf(asset.displayName) !== -1) {
        this.removeFile(asset);
      }
    });
    let fileListLength = 0;
    this.cameraFolders.forEach(folder => {
      if (fileList === folder.fileNameList) {
        fileListLength =
          fileListLength + folder.fileNameList.length - fileList.length;
      } else {
        fileListLength = fileListLength + folder.fileNameList.length;
      }
    });
    if (this.packageUploader.assetUploaders.length > fileListLength) {
      this.parseAndRemoveFolderAssets(fileList, folder);
    } else {
      let folderIndex = this.cameraFolders.indexOf(folder);
      this.cameraFolders.splice(folderIndex, 1);
    }
  }
  removeFile(asset) {
    let clipIndex = this.clips.indexOf(asset.name);
    this.clips.splice(clipIndex, 1);
    if (clipIndex === 0) {
      this.clips = [];
    }
    console.log(this.clips);
    let status = this.packageUploader.removeAsset(asset);
    // if we were over the limit and enough assets have been removed, clear the error message
    if (this.packageUploader.assetUploaders.length <= this.clipLimit) {
      this.clipsErrorMessage = null;
    }
    if (this.packageUploader.assetUploaders.length === 0) {
      this.clipDropZone.hasDirectory = false;
    }
  }

  upload() {
    let errors = this.validationController.validate();
    if (errors.length > 0) return;

    this.showUploadErrorMessage = false;

    this.packageUploader.owner = this.owner;
    this.packageUploader.name = this.name;
    this.packageUploader.description = this.description;
    this.packageUploader.city = this.city || "";
    this.packageUploader.stateOrProvince = this.stateOrProvince || "";
    this.packageUploader.country = this.country || null;
    this.packageUploader.dateShot = this.dateShot || "";
    this.packageUploader.notes = this.notes || "";

    // this will disable fields and hide buttons
    this.isUploading = true;
    this.cameraFolders = [];
    this.clips = [];
    // start the upload
    this.packageUploader.upload().then(
      success => {
        this.isUploading = false;
        if (success) {
          // add the package to the manager
          this.uploadManager.addPackage(this.packageUploader);

          if (!this.isInitialUpload) $("#uploadConfirmation").modal("show");
          else this.close();
        } else {
          this.showUploadErrorMessage = true;
        }
      },
      () => {
        this.isUploading = false;
        this.showUploadErrorMessage = true;
      }
    );
  }

  canGoToStep(goTo, cur) {
    if (cur === 1 && goTo === 2) {
      if (this.packageUploader.assetUploaders.length === 0)
        this.clipsErrorMessage = "Please select at least 1 clip to upload.";
    }

    if (this.clipsErrorMessage) return false;

    return true;
  }

  hideConfirmation() {
    $("#uploadConfirmation").modal("hide");
  }

  uploadMore() {
    this.hideConfirmation();
    this.multiStepModal.reset();
  }

  goToUploads() {
    if (this.isInitialUpload) return;

    this.close();
    window.location.href = "/#/dashboard/uploads";
  }

  close() {
    this.hideConfirmation();
    $("#myUpload").modal("hide");
  }

  clear() {
    this.name = null;
    this.description = null;
    this.city = null;
    this.stateOrProvince = null;
    this.country = null;
    this.dateShot = null;
    this.notes = null;

    this.isProxyUpload = false;
    this.owner = null;
    this.expectCameraFolder = "off";
    this.packageUploader = this.packageUploaderFactory();
    this.packageUploader.isInitialUpload = this.isInitialUpload;
    this.isUploading = false;
    this.hasError = false;
    this.showUploadErrorMessage = false;
    this.error = null;
    this.clipsErrorMessage = null;
    this.validationController.reset();
  }
}

ValidationRules.ensure("name")
  .required()
  .ensure("description")
  .required()
  //.ensure('city').required()
  //.ensure('country').required()
  .on(NewUploadPackage);
