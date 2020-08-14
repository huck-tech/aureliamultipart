export class UploadManager {
  id = null;

  packageUploaders = [];
  assetUploaders = [];

  isUploading = false;
  hasFailures = false;
  uploadsInProgress = 0;
  uploadsFailed = 0;
  uploadedBytes = 0;
  totalBytes = 0;
  avgTransferRate = 0;
  percentComplete = 0;
  progressLastReported;
  timeRemainingInSecs = 0;
  isUploaded = false;
  uploaded = [];
  updateHandlers = [];
  packageId = null;
  initiatingRetry = false;
  successUploads = [];
  failedUploads = [];
  debugLogging = false;

  addPackage(packageUploader) {
    this.packageUploaders.push(packageUploader);

    if (!this.isUploading) {
      this.isUploaded = false;
      this.packageId = null;
      this.isUploading = true;
      this.avgTransferRate = null;
      this.transferRates = [];
      this.waitForUploadUpdates(this);
    }
  }

  addAsset(assetUploader) {
    this.assetUploaders.push(assetUploader);

    if (!this.isUploading) {
      this.isUploading = true;
      this.avgTransferRate = null;
      this.transferRates = [];
      this.waitForUploadUpdates(this);
    }
  }

  addUpdateHandler(handler) {
    this.updateHandlers.push(handler);
  }

  updateUploadState() {
    this.hasFailures =
      this.packageUploaders.some(pkg => pkg.hasFailures) ||
      this.assetUploaders.some(a => a.hasFailures);
    this.uploadsInProgress =
      this.packageUploaders
        .filter(pkg => pkg.isUploading)
        .reduce((sum, pkg) => sum + pkg.uploadsInProgress, 0) +
      this.assetUploaders.filter(a => a.isUploading).length;
    this.uploadsFailed =
      this.packageUploaders
        .filter(pkg => pkg.hasFailures)
        .reduce((sum, pkg) => sum + pkg.uploadsFailed, 0) +
      this.assetUploaders.filter(a => a.hasFailures).length;
    this.isUploading = window.isUploading =
      this.packageUploaders.some(pkg => pkg.isUploading) ||
      this.assetUploaders.some(a => a.isUploading);

    const curUploadedBytes =
      this.packageUploaders
        .filter(pkg => pkg.isUploading)
        .reduce((sum, pkg) => sum + pkg.uploadedBytes, 0) +
      this.assetUploaders
        .filter(a => a.isUploading)
        .reduce((sum, a) => sum + a.uploaded, 0);
    const curTime = new Date();

    if (this.progressLastReported) {
      // calculate new transfer rate
      const transferRate =
        (curUploadedBytes - this.uploadedBytes) /
        ((curTime.getTime() - this.progressLastReported.getTime()) / 1000);

      // only update the transfer rate if possible - case when upload completes and cur uploaded is less than prev uploaded
      if (transferRate && transferRate > 0) {
        // only keep the last 30 secs worth of data to prevent sudden changes in speed from not being reflected during long uploads
        if (this.transferRates.length === 30) {
          this.transferRates.shift();
        }
        this.transferRates.push(transferRate);
        this.avgTransferRate =
          this.transferRates.reduce((sum, rate) => (sum += rate), 0) /
          this.transferRates.length;
      }
    }

    this.uploadedBytes = curUploadedBytes;
    this.progressLastReported = curTime;

    this.totalBytes =
      this.packageUploaders
        .filter(pkg => pkg.isUploading)
        .reduce((sum, pkg) => sum + pkg.totalBytes, 0) +
      this.assetUploaders
        .filter(a => a.isUploading)
        .reduce((sum, a) => sum + a.size, 0);

    if (this.avgTransferRate) {
      this.timeRemainingInSecs =
        (this.totalBytes - this.uploadedBytes) / this.avgTransferRate;
    }

    //console.log(`manager: ${this.id} | uploading: ${this.isUploading} | uploadsInProgress: ${this.uploadsInProgress} | uploadedBytes: ${this.uploadedBytes} | totalBytes: ${this.totalBytes} | transferRate: ${this.transferRate}`);

    this.percentComplete = this.isUploading
      ? Math.round(this.uploadedBytes * 10000 / this.totalBytes) / 100
      : 0;
    // invoke update handlers, if any
    for (let i = 0; i < this.updateHandlers.length; i++) {
      this.updateHandlers[i]();
    }

  }

  waitForUploadUpdates(immediate = false) {
    if (immediate) {
      this.updateUploadState();
    }

    setTimeout(() => {
      this.updateUploadState();

      if (this.isUploading) this.waitForUploadUpdates();
      else {
        this.avgTransferRate = null;
        this.transferRates = [];
      }
    }, 1000);
  }

  getPackage(id) {
    let matches = this.packageUploaders.filter(p => p.id === id);
    return matches.length > 0 ? matches[0] : null;
  }

  getAsset(id) {
    const matches = this.assetUploaders.filter(a => a.id === id);
    return matches.length > 0 ? matches[0] : null;
  }

  clearErrors() {
    this.packageUploaders.forEach(pkg => pkg.clearErrors());
    this.assetUploaders.forEach(a => a.clearErrors());
    this.hasFailures = false;
    this.updateUploadState();
  }

  retryFailedUploads() {
    this.initiatingRetry = true;
    Promise.race(
      this.packageUploaders
        .filter(pkg => pkg.hasFailures)
        .map(pkg => pkg.retry())
        .concat(
          this.assetUploaders.filter(a => a.hasFailures).map(a => a.retry())
        )
    ).then(() => {
      this.initiatingRetry = false;
      this.waitForUploadUpdates(true);
    });
  }
}
