import { inject, bindable, computedFrom } from "aurelia-framework";
import { HttpClient, json } from "aurelia-fetch-client";
import { BindingEngine } from "aurelia-binding";
import moment from "moment";
import { UploadManager } from "common/uploads/upload-manager";

@inject(UploadManager, BindingEngine)
export class UploadPackage {
  @bindable isShowingDetails = false;
  @bindable data = null;
  @bindable packageUploader = null;

  @bindable uploadedBytes = 0;
  @bindable totalBytes = 0;
  @bindable uploadedAssets = 0;
  @bindable totalAssets = 0;
  @bindable videoAssetCount = 0;
  @bindable progress = 0;
  @bindable uploadSpeed = 0;

  constructor(uploadManager, bindingEngine) {
    this.uploadManager = uploadManager;
    bindingEngine
      .propertyObserver(this, "data")
      .subscribe(() => this.updateFromData());
  }

  @computedFrom("data")
  get statusIconClass() {
    if (!this.data || !this.data.status || !this.data.status.name) return;

    switch (this.data.status.name) {
      case "Uploading":
      case "Ingesting":
        return "upload";
      case "Ready":
        return "check";
      case "UploadFailed":
      case "IngestFailed":
        return "exclamation-triangle";
    }
  }

  bind() {
    this.updateFromData();
  }

  updateFromData() {
    this.packageUploader = this.uploadManager.getPackage(this.data.id);
    if (this.packageUploader) {
      this.isLive = this.packageUploader.isUploading;
      this.totalBytes = this.packageUploader.totalBytes;
      this.videoAssetCount = this.packageUploader.assetUploaders.filter(
        au => !au.isRelease
      ).length;
      this.totalAssets = this.packageUploader.assetUploaders.length;

      if (this.isLive) this.intervalId = setInterval(() => this.updateState());
    } else {
      // this.videoAssetCount = this.data.asset_package.length;
      this.videoAssetCount = 0;
    }
  }

  setSelected() {
    this.data.isSelected = true;
  }

  updateState() {
    const oldUploadedBytes = this.uploadedBytes;

    this.uploadedBytes = this.packageUploader.uploadedBytes;
    this.uploadedAssets =
      this.totalAssets - this.packageUploader.uploadsInProgress;

    this.progress =
      Math.floor(this.uploadedBytes / this.totalBytes * 10000) / 100;
    if (oldUploadedBytes > 0)
      this.uploadSpeed = this.uploadedBytes - oldUploadedBytes;

    if (!this.packageUploader.isUploading) {
      clearInterval(this.intervalId);
      this.isLive = false;
    }
  }

  //startLiveUpdates(target) {
  //    setTimeout(
  //        function() {
  //            target.updateState();

  //            if (target.isUploading)
  //                target.startLiveUpdates(target);
  //        },
  //        1000);
  //}
}
