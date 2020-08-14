import { inject, LogManager } from "aurelia-framework";
import { AuthService } from "aurelia-auth";
import { S3MultipartUpload } from "./s3-multipart-upload";
import config from "app-config";
@inject(LogManager, AuthService, config)
export class S3UploadManager {

  constructor(logManager, authService, config) {
    this.logManager = logManager;
    this.authService = authService;
    this.config = config.s3;

    // create logger
    this.logger = this.logManager.getLogger("S3UploadManager");

    // maintain list of running and queued uploads
    this.running = [];
    this.queued = [];
    this.runningParts = [];
    this.queuedParts = [];
  }

  createUpload(name, file, ids) {
    // set authentication header
    const signingHeaders = {};
    signingHeaders[this.authService.config.authHeader] =
      this.authService.config.authToken +
      " " +
      this.authService.auth.getToken();
                // create evaporate object and use it to do the upload
    const upload = new S3MultipartUpload(
      this,
      this.logManager,
      this.config,
      signingHeaders,
      name,
      file, 
      ids
    );

    // remove from manager on completion or failure
    upload.addEventListener("completed", () =>
      this.handleUploadFinished(upload)
    );
    upload.addEventListener("failed", () => this.handleUploadFinished(upload));

    return upload;
  }

  queueUpload(upload, ids) {
    // if we've reached the limit of concurrent uploads, add to the queue
    // otherwise, start the upload now
    if (this.running.length >= this.config.concurrentFiles) {
      this.queued.push(upload);
      this.logger.info(
        `Upload of ${upload.name} has been queued because there are currently ${this
          .running.length} active uploads (max = ${this.config
          .concurrentFiles}).`
      );
    } else {
      this.running.push(upload);
      upload.upload();
    }
  }

  handleUploadFinished(upload) {
    // remove from the list of running uploads
    this.running.splice(this.running.indexOf(upload), 1);

    // if there are any queued, start the next one
    if (this.queued.length > 0) {
      this.logger.info(
        `Processing next upload in queue of ${this.queued.length} uploads.`
      );

      // pull the first in the queue out
      const next = this.queued.shift();
      this.logger.info(`Dequeued upload ${next.name}. Uploading now...`);

      // push it to the array of running uploads
      this.running.push(next);

      // start the next upload
      next.upload();
    }
  }

  queueUploadPart(uploadPart) {
    // return a promise that resolves when the upload part completes
    return new Promise(resolve => {
      // if there are more running parts than allowed, add to the queue with the promise resolver
      if (this.runningParts.length >= this.config.concurrentParts) {
        this.queuedParts.push({
          part: uploadPart,
          promiseResolve: resolve
        });
        this.logger.info(
          `Upload part #${uploadPart.partNum} of ${uploadPart.name} has been queued becuase there are currently ${this
            .runningParts.length} active upload parts in progress (max = ${this
            .config.concurrentParts}).`
        );
      } else {
        // run the part upload now
        this.runningParts.push(uploadPart);
        uploadPart
          .upload()
          .then(() => this.handlePartFinished(uploadPart))
          .then(() => resolve(uploadPart));
      }
    });
  }

  handlePartFinished(uploadPart) {
    // remove the part from the list of running parts
    this.runningParts.splice(this.runningParts.indexOf(uploadPart), 1);

    // if there are any queued , start the next part
    if (this.queuedParts.length > 0) {
      this.logger.info(
        `Processing next upload part in queue of ${this.queuedParts
          .length} upload parts.`
      );

      // pull the first in the queue out
      const nextPart = this.queuedParts.shift();
      this.logger.info(
        `Dequeued upload part #${nextPart.part.partNum} of ${nextPart.part
          .name}. Uploading now...`
      );

      // push it to the array of running parts
      this.runningParts.push(nextPart.part);

      // start uploading the part, and when it's finished, resolve it's associated promise
      nextPart.part
        .upload()
        .then(() => this.handlePartFinished(nextPart.part))
        .then(() => nextPart.promiseResolve(nextPart.part));
    }
  }
}
