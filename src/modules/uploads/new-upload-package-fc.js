import {
  BindingEngine,
  bindable,
  computedFrom,
  inject,
  NewInstance
} from "aurelia-framework";
import { ValidationController } from "aurelia-validation";
import { ValidationRules } from "aurelia-validatejs";
import { HttpClient, json } from "aurelia-fetch-client";
import { Router } from "aurelia-router";
import moment from "moment-timezone";
import { countries } from "country-data";
import $ from "jquery";
import { Factory } from "helpers/factory";
import { MultiStepModal } from "helpers/modals";
import { User } from "user";
import config from "app-config";

@inject(
  HttpClient,
  Router,
  MultiStepModal,
  NewInstance.of(ValidationController),
  countries,
  User,
  BindingEngine
)
export class NewUploadPackage {
  @bindable name = null;
  @bindable description = null;
  @bindable city = null;
  @bindable stateOrProvince = null;
  @bindable country = null;
  @bindable dateShot = null;
  @bindable notes = null;
  @bindable country_array = [];
  @bindable owner = null;
  @bindable users = [];

  @bindable settings;
  @bindable cameraFolders = [];
  @bindable clips = [];
  @bindable displayError = false;
  @bindable clipsExist = false;
  @bindable erroredAlready = false;
  isInitialUpload = false;
  allUploadNames = [];
  uploadNames = [];
  timestamp = "";
  packageId = "";
  nodes = [];
  constructor(
    httpClient,
    router,
    multiStepModal,
    validationController,
    countries,
    user,
    bindingEngine
  ) {
    this.httpClient = httpClient;
    this.router = router;
    this.multiStepModal = multiStepModal;
    this.validationController = validationController;
    this.bindingEngine = bindingEngine;
    this.successfulUploads = [];
    this.countries = countries;
    this.user = user;
    this.localFiles = "";
  }
  displayFiles() {
    this.localFiles.find("#localFiles-heading").css({ display: "none" });
    this.localFiles.find("#localFiles-list").css({ display: "none" });
    this.localFiles.find("#localFiles-info").css({ display: "none" });
    this.localFiles.find("#localFiles-email").css({ display: "none" });
    this.localFiles.find(".action-transfer").css({ display: "none" });
    this.localFiles.find(".action-addtoqueue").css({ display: "none" });
    this.localFiles.find(".action-removefromqueue").css({ display: "none" });
    this.localFiles.find(".action-clearqueue").css({ display: "none" });
    this.localFiles.find("#localFiles-queue").css({ display: "block" });
  }
  displayInfo() {
    this.localFiles.find("#localFiles-heading").css({ display: "none" });
    this.localFiles.find("#localFiles-list").css({ display: "none" });
    this.localFiles.find("#localFiles-info").css({ display: "block" });
    this.localFiles.find("#localFiles-email").css({ display: "none" });
    this.localFiles.find(".action-transfer").css({ display: "none" });
    this.localFiles.find(".action-addtoqueue").css({ display: "none" });
    this.localFiles.find(".action-removefromqueue").css({ display: "none" });
    this.localFiles.find(".action-clearqueue").css({ display: "none" });
    this.localFiles.find("#localFiles-queue").css({ display: "none" });
  }
  attached() {
    // this.checkForFailedUploads();
    this.multiStepModal.initialize("myUpload");
    this.multiStepModal.addResetHandler(() => this.clear());
    this.multiStepModal.canGoToStep = (goTo, cur) =>
      this.canGoToStep(goTo, cur);
    $("#addClipsModal").modal("hide");
    $("#myUpload").on("show.bs.modal", evt => {
      if (this.localFiles === "") {
        this.localFiles = $("#localFiles");
        // shim.clearQueue();
      } else {
        this.localFiles.appendTo("#upload1").css({ display: "block" });
        // shim.clearQueue();
        this.localFiles.find("#localFiles-info").addClass("clipsModalInfo");
        this.localFiles.find("#localFiles-info").css({ display: "none" });
      }
      this.sortedCountries();
      this.displayFiles();
      if (evt.target && evt.target.id === "myUpload") {
        this.multiStepModal.reset();
      }
    });
  }

  addClips() {
    $("#addClipsModal").modal("show");
    $("#addClipsModal").on("hide.bs.modal", () => {
      this.closeUploadModal();
    });
    this.localFiles.appendTo("#clips-select-dialog");
    this.localFiles.find(".action-addtoqueue").css({
      display: "inline-block",
      float: "left",
      marginTop: "-20px"
    });
    this.localFiles.find("#localFiles-list").css({ display: "block" });
    this.localFiles.find("#localFiles-queue").css({ display: "none" });
    this.localFiles
      .find("#localFiles-fileListTable > tbody > tr > td.pointer.icon-queue")
      .css({ display: "none" });
    this.localFiles
      .find("#localFiles-fileListTable > tbody > tr.pointer.file.icon-queue")
      .css({ display: "none" });
    this.localFiles.find("#localFiles-upload").css({ display: "none" });
    this.localFiles.find("#localFiles-queue").addClass("clipsModalQueue");
    this.localFiles
      .find(
        "#localFiles-controls > button.button.btn.btn-xs.btn-primary.pointer.action-addtoqueue"
      )
      .addClass("clipsModalAddButton");
    this.localFiles
      .find(".clipsModalQueue > table > tbody")
      .on("DOMNodeInserted", evt => {
        evt.preventDefault();
        this.localFiles.find("#localFiles-queue").css({ display: "none" });
      });
    this.localFiles
      .find("#localFiles-list > table > tbody")
      .on("DOMNodeInserted", evt => {
        evt.preventDefault();
        this.localFiles
          .find(
            "#localFiles-fileListTable > tbody > tr > td.pointer.icon-queue"
          )
          .css({ display: "none" });
      });
    this.localFiles.find(".clipsModalAddButton").on("click", e => {
      $("#addClipsModal").modal("hide");
      this.localFiles
        .find(
          "#localFiles-controls > button.button.btn.btn-xs.btn-primary.pointer.action-addtoqueue.clipsModalAddButton"
        )
        .removeClass("clipsModalAddButton");
      this.closeUploadModal;
    });
    this.localFiles
    .find(".clipsModalInfo > table > tbody")
    .on("DOMNodeInserted", evt => {
      evt.preventDefault();
      this.localFiles.find("#localFiles-info").css({ display: "none" });
    });
  }
  addReleases() {
    $("#addReleaseModal").modal("show");
    $("#addReleaseModal").on("hide.bs.modal", () => {
      this.closeReleaseModal();
    });
    this.localFiles.appendTo("#release-select-dialog");
    this.localFiles.find(".action-addtoqueue").css({
      display: "inline-block",
      float: "left",
      marginTop: "-20px"
    });
    this.localFiles.find("#localFiles-list").css({ display: "block" });
    this.localFiles.find("#localFiles-queue").css({ display: "none" });
    this.localFiles
      .find("#localFiles-fileListTable > tbody > tr td.pointer.icon-queue > i")
      .css({ display: "none" });
    this.localFiles.find("#localFiles-queue").addClass("releasesModalQueue");
    this.localFiles
      .find(
        "#localFiles-controls > button.button.btn.btn-xs.btn-primary.pointer.action-addtoqueue"
      )
      .addClass("releaseModalAddButton");
    this.localFiles
      .find(".releasesModalQueue > table > tbody")
      .on("DOMNodeInserted", evt => {
        evt.preventDefault();
        this.localFiles.find("#localFiles-queue").css({ display: "none" });
      });
    this.localFiles
      .find("#localFiles-list > table > tbody")
      .on("DOMNodeInserted", evt => {
        evt.preventDefault();
        this.localFiles
          .find(
            "#localFiles-fileListTable > tbody > tr > td.pointer.icon-queue"
          )
          .css({ display: "none" });
      });
    this.localFiles.find(".releaseModalAddButton").on("click", e => {
      $("#addReleaseModal").modal("hide");
      this.localFiles
        .find(
          "#localFiles-controls > button.button.btn.btn-xs.btn-primary.pointer.action-addtoqueue.releaseModalAddButton"
        )
        .removeClass("releaseModalAddButton");
      this.closeReleaseModal;
    });
  }

  closeUploadModal() {
    this.localFiles.appendTo("#upload1");
    this.localFiles.find("#localFiles-list").css({ display: "none" });
    this.localFiles.find("#localFiles-queue").css({ display: "block" });
    this.localFiles.find(".action-addtoqueue").css({ display: "none" });
    this.localFiles
      .find(".clipsModalQueue > table > tbody")
      .off("DOMNodeInserted");
  }

  closeReleaseModal() {
    this.localFiles.appendTo("#upload2");
    this.localFiles.find("#localFiles-list").css({ display: "none" });
    this.localFiles.find("#localFiles-queue").css({ display: "block" });
    this.localFiles.find(".action-addtoqueue").css({ display: "none" });
    this.localFiles
      .find(".releasesModalQueue > table > tbody")
      .off("DOMNodeInserted");
  }
  clearWizard = () => {
    this.name = null;
    this.description = null;
    (this.city = null), (this.stateOrProvince = null);
    this.country = null;
    (this.dateShot = null), (this.notes = null), (this.country_array = []);
    this.owner = null;
  };
  upload = () => {
    let errors = this.validationController.validate();
    if (errors.length > 0) return;
    shim.combineQueue();
    this.timestamp = moment.tz("Europe/London").format("YYYYMMDDHHmmss");
    for (let i = 0; i < pg.storedNodes.local.queue.fileObjectList.length; i++) {
      this.uploadNames.push(pg.storedNodes.local.queue.fileObjectList[i].name);
    }
    this.showUploadErrorMessage = false;
    pg.config.webapp.doAfterSuccess = this.completeUpload;
    pg.config.webapp.doAfterError = this.transferErrored;
    pg.config.webapp.doAfterCancel = this.transferErrored;
    pg.config.webapp.doAfterOtherError = this.transferErrored;
    pg.config.webapp.doAfterTransfer = "";
    this.createPackage();
    this.close();
    $("#utility-upload-info").append(this.localFiles);
    this.localFiles
    .find(".clipsModalQueue > table > tbody")
    .on("DOMNodeInserted", evt => {
      evt.preventDefault();
      this.localFiles.find("#localFiles-queue").css({ display: "none" });
    });
    this.displayInfo();
  };
  transferCanceled = () => {
    this.localFiles.css({ display: "none" });
  };
  completeUpload = () => {
    for (let i = 0; i < this.allUploadNames.length; i++) {
      this.updatePackage(this.allUploadNames[i].packageId);
    }
    this.localFiles.css({ display: "none" });
    this.localFiles.find("#localFiles-queue").css({ display: "none" });
  };
  transferErrored = error => {
    if (this.erroredAlready === true) return;
    if (error === "failed_to_create_package") {
      this.sendErrorEmail(error);
      this.erroredAlready = true;
    } else if (error === "success_but_failed_to_update") {
      this.sendErrorEmail(error);
      this.erroredAlready = true;
    } else {
      this.sendErrorEmail("upload_failed");
      this.erroredAlready = true;
    }
    this.localFiles.css({ display: "none" });
  };
  sendErrorEmail = error => {
    let errorBody = {
      error: error,
      packageId: this.packageId
    };
    return this.httpClient
      .fetch(config.packageApiUrls.packageErrorUrl, {
        method: "post",
        mode: "cors",
        body: json(errorBody)
      })
      .then(resp => {
        if (resp.ok) {
          console.log("error with package successfully reported");
          $("#errorModal").modal("show");
          shim.clearCachedQueue();
          shim.clearQueue();
        } else {
          $("#errorModal").modal("show");
          shim.clearCachedQueue();
          shim.clearQueue();
          console.log("failed to report error");
        }
      });
  };
  closeErrorDialog = () => {
    $("#errorModal").modal("hide");
  };
  createPackage = () => {
    let uploadObject = this.createUploadObject("False", null);
    this.clearWizard();
    return this.httpClient
      .fetch(config.packageApiUrls.packageCreateUrl, {
        method: "post",
        mode: "cors",
        body: json(uploadObject)
      })
      .then(resp => {
        if (resp.ok) {
          return resp.json().then(packageData => {
            this.packageId = packageData.id;
            this.allUploadNames.push({
              packageId: packageData.id,
              uploadNames: this.uploadNames
            });
            this.uploadNames = [];
            let prefix =
              packageData.id +
              "-" +
              packageData.userId +
              "-" +
              packageData.timestamp;
            let $uploadBtn = $("#localFiles-controls .action-transfer");
            let sourceNode =
              pg.storedNodes[$uploadBtn.parent().data("connectionKey")];
            let targetKey = $uploadBtn.data("connectionkey");
            let targetNode = pg.storedNodes[targetKey];
            pg.config.remoteNodes.server1.remoteDirectory =
              config.remoteDirectory;
            let node = {
              sourceNode: sourceNode,
              prefix: prefix,
              packageId: packageData.id
            };
            this.nodes.push(node);
            pg.queue.transferPut(
              sourceNode,
              targetNode,
              prefix,
              packageData.id
            );
            this.subscription = this.bindingEngine
              .collectionObserver(pg.successFiles)
              .subscribe(this.individualUploadComplete);
            pg.queue.clear(sourceNode);
            shim.clearCachedQueue();
          });
        } else {
          this.displayError = true;
          this.transferErrored("failed_to_create_package");
        }
      });
  };
  individualUploadComplete = changes => {
    let filename = pg.successFiles[pg.successFiles.length - 1].replace(
      /^.*[\\\/]/,
      ""
    );
    for (var i = 0; i < this.nodes.length; i++) {
      for (var j = 1; j < this.nodes[i].sourceNode.fileSet.length; j++) {
        if (filename === this.nodes[i].sourceNode.fileSet[j].name) {
          let fileObject = {
            package_id: this.nodes[i].packageId,
            prefix: this.nodes[i].prefix,
            filepath: filename,
            node: this.nodes[i]
          };
          return this.httpClient
            .fetch(config.packageApiUrls.fileCompletionUrl, {
              method: "post",
              mode: "cors",
              body: json(fileObject)
            })
            .then(resp => {
              if (resp.ok) {
                return resp.json().then(response => {
                  console.log('file uploaded');
                });
              } else {
                console.log("err");
              }
            });
        }
      }
    }
  };
  updatePackage = packageId => {
    let uploadObject = this.createUploadObject("True", packageId);
    return this.httpClient
      .fetch(config.packageApiUrls.packageUpdateUrl, {
        method: "put",
        mode: "cors",
        body: json(uploadObject)
      })
      .then(resp => {
        if (resp.ok) {
          return resp.json().then(packageData => {
            console.log('package updated');
          });
        } else {
          this.displayError = true;
          this.transferErrored("success_but_failed_to_update");
        }
      });
  };
  checkForFailedUploads = () => {
    return this.httpClient
      .fetch(config.accountsApiUrls.checkForFailedUploadsUrl, {
        method: "get",
        mode: "cors"
      })
      .then(resp => {
        if (resp.ok) {
          return resp.json().then(failures => {
            if(failures.uploads_to_retry) {
              for (let i=0; i<failures.uploads_to_retry.length; i++) {
                this.resumeTransfer(failures.uploads_to_retry[i].sourceNode)
              }
            }
          });
        } else {
         console.log('failed to get failures')
        }
      });

  }

  resumeTransfer(theNode) {
    let $uploadBtn = $("#localFiles-controls .action-transfer");
    // let sourceNode =
    //   pg.storedNodes[$uploadBtn.parent().data("connectionKey")];
    let sourceNode = theNode;
    let targetKey = $uploadBtn.data("connectionkey");
    let targetNode = pg.storedNodes[targetKey];
    pg.config.remoteNodes.server1.remoteDirectory =
      config.remoteDirectory;
    let node = {
      sourceNode: sourceNode,
      prefix: prefix,
      packageId: packageData.id
    };
    this.nodes.push(node);
    pg.queue.transferPut(
      sourceNode,
      targetNode,
      prefix
    );
  }
  createUploadObject(upload, packageId) {
    let releases;
    if (shim.cachedQueue2.fileObjectList.length > 0) {
      releases = shim.cachedQueue2.fileObjectList;
    } else {
      releases = [];
    }
    let uploadNames;
    if (this.allUploadNames.length > 1) {
      uploadNames = this.searchNamesAndIds(packageId, this.allUploadNames)
        .uploadNames;
    } else {
      uploadNames = this.uploadNames;
    }
    let uploadObj;
    if (!packageId) {
      uploadObj = {
        package_name: this.name,
        package_description: this.description,
        city: this.city,
        state: this.stateOrProvince,
        country: this.country !== null ? this.country.name : null,
        shot_date: this.dateShot,
        notes: this.notes,
        userId: this.owner ? this.owner.id : this.user.data.id,
        clips: shim.cachedQueue1.fileObjectList,
        releases: releases,
        isForProspectiveContributor: this.isInitialUpload,
        uploadRetry: "False",
        uploadFailed: "False",
        uploadFinished: "False",
        timestamp: this.timestamp,
        uploadNames: uploadNames
      };
    } else {
      uploadObj = {
        package_id: packageId,
        uploadFinished: "True"
      };
    }

    return uploadObj;
  }
  searchNamesAndIds(id, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].packageId === id) {
        return array[i];
      }
    }
  }
  canGoToStep(goTo, cur) {
    if (goTo === 1) {
      this.localFiles.appendTo("#upload1");
      this.displayFiles();
    } else if (goTo === 2) {
      this.localFiles.appendTo("#upload2");
      this.displayFiles();
    }
    return true;
  }

  hideConfirmation() {
    $("#uploadConfirmation").modal("hide");
  }

  goToUploads() {
    if (this.isInitialUpload) return;

    this.close();
    window.location.href = "/#/dashboard/uploads";
  }

  close() {
    $("#myUpload").modal("hide");
  }

  closeClipsSelector() {
    $("#addClipsModal").modal("hide");
  }
  closeReleaseSelector() {
    $("#addReleaseModal").modal("hide");
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
    this.hasError = false;
    this.error = null;
    this.validationController.reset();
  }
  sortedCountries() {
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
    this.country_array = country_array;
  }
}
ValidationRules.ensure("name")
  .required()
  .ensure("description")
  .required()
  //.ensure('city').required()
  //.ensure('country').required()
  .on(NewUploadPackage);
