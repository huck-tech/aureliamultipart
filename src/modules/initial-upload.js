import { inject, bindable, computedFrom } from "aurelia-framework";
import { LogManager } from "aurelia-framework";
import { User } from "user";
import { HttpClient, json } from "aurelia-fetch-client";
import { EventAggregator } from "aurelia-event-aggregator";
import { UploadManager } from "common/uploads/upload-manager";

import config from "app-config";

@inject(User, HttpClient, EventAggregator, UploadManager, LogManager, config)
export class InitialUpload {
  lastMaxPosition = 0;
  maxPosition = 0;
  @bindable step = 1;

  @bindable showingUploads = false;
  @bindable tutorialCompleted = false;

  @bindable progressPercentage = 0;

  @bindable numClipsUploaded = 0;
  @bindable numClipsUploading = 0;
  @bindable numClipsRequired = 10;
  @bindable numClipsFailed = 0;

  constructor(
    user,
    httpClient,
    eventAggregator,
    uploadManager,
    logManager,
    config
  ) {
    this.user = user;
    this.httpClient = httpClient;
    this.eventAggregator = eventAggregator;
    this.uploadManager = uploadManager;
    this.config = config;

    this.logger = logManager.getLogger("InitialUpload");
    
    this.eventAggregator.subscribe("fileUploadStarted", file => {
      if (!file.isRelease) this.numClipsUploading++;
    });
    this.eventAggregator.subscribe("fileUploadFailed", file => {
      this.logger.error(`Upload of file ${file.name} failed.`);
      if (!file.isRelease) {
        this.numClipsUploading--;
        this.numClipsFailed++;
      }
    });
    this.eventAggregator.subscribe("fileUploadCompleted", file => {
      this.logger.info(`Upload of file ${file.name} completed successfully.`);
      if (!file.isRelease) this.handleFileUploadCompletion(file);
    });
  }

  @computedFrom("numClipsUploaded", "numClipsRequired")
  get uploadsCompleted() {
    return this.numClipsUploaded >= this.numClipsRequired;
  }

  @computedFrom("numClipsUploading", "numClipsRequired")
  get uploadsRemaining() {
    return this.numClipsRequired - this.numClipsUploading;
  }

  attached() {
    // console.log("Attaching");
    // set up the tutorial video
    // this.video = $('#tutorialVideo')[0];
    // if (!this.video) {
    //     console.error('Tutorial video tag not found in DOM.');
    //     return;
    // }

    this.setupTutorial();

    if (
      !this.user.data ||
      !this.user.data.onboardingState ||
      !this.user.data.onboardingState
    ) {
      this.logger.error("Onboarding state is not set.");
    } else {
      this.logger.info(
        `Onboarding state: ${JSON.stringify(this.user.data.onboardingState)}`
      );
    }

    // set number of clips uploaded from what's stored in the database
    if (this.user.data.onboardingState.initialClipsUploaded) {
      this.logger.info(
        "Initial clips uploaded: " +
          this.user.data.onboardingState.initialClipsUploaded
      );
      this.numClipsUploaded = this.numClipsUploading = this.user.data.onboardingState.initialClipsUploaded;
    }

    // step 2 is the WatchTutorial step
    if (this.user.data.onboardingState.currentStepId > 2) {
      this.logger.info(
        `Current onboarding step is: ${this.user.data.onboardingState
          .currentStepId}. Setting tutorial to watched.`
      );
      this.tutorialCompleted = true;

      if (this.uploadsCompleted) {
        this.logger.info(
          `Skipping uploads. Clips uploaded (${this
            .numClipsUploaded}) is greater than or equal to required clip count (${this
            .numClipsRequired})`
        );
        this.step = 3;
      } else {
        this.logger.info(
          `Uploads still pending. Clips uploaded (${this
            .numClipsUploaded}) is less than required clip count (${this
            .numClipsRequired})`
        );
        this.step = 2;
      }
    }
  }

  setupTutorial() {
    this.video = $("#tutorialVideo")[0];
    if (!this.video) {
      console.error("Tutorial video tag not found in DOM.");
      return;
    }

    // first try to get a previous value from storage - if not found, try to use the value
    // provided in user data from the database
    if (this.user.data.onboardingState.tutorialPositionInSecs) {
      this.logger.info(
        `Max tutorial position found in on onboarding state record. Setting max position to ${this
          .user.data.onboardingState.tutorialPositionInSecs}.`
      );
      this.maxPosition = this.lastMaxPosition = this.user.data.onboardingState.tutorialPositionInSecs;
    }

    // if the user has already seen the tutorial, they are free to seek as much as they want
    if (this.user.hasWatchedTutorial) {
      this.logger.info(
        `User has already finished tutorial (current step is ${this.user.data
          .onboardingState.currentStepId}).`
      );
      this.maxPosition = this.lastMaxPosition = this.video.duration;
    } else {
      this.logger.info(
        `User has not yet finished tutorial (current step is ${this.user.data
          .onboardingState.currentStepId}).`
      );

      // update the max position every five seconds
      this.intervalId = setInterval(() => {
        this.logger.info(
          `Video timer elapsed - cur max: ${this.maxPosition}, last max: ${this
            .lastMaxPosition}`
        );

        if (this.maxPosition > this.lastMaxPosition) {
          // this.httpClient.fetch(`/users/tutorial/position/${this.maxPosition}`, {
          // var hasWatched = (this.user.hasWatchedTutorial === true) ? "True" : "False";
          this.httpClient
            .fetch(config.contributorApiUrls.tutorialVideoWatchUrl, {
              mode: "cors",
              method: "post",
              body: json({
                tutorial_watched_second: this.maxPosition
              })
            })
            .then(resp => {
              if (resp.ok) {
                this.logger.info(
                  `New max tutorial position of ${this
                    .maxPosition} persisted successfully. Setting last max to current max.`
                );
                this.lastMaxPosition = this.maxPosition;
              } else {
                this.logger.error(
                  `An error occurred during the call to update the user's tutorial position to ${this
                    .maxPosition}.`
                );
              }
            })
            .catch(err => {
              this.logger.error(
                `An error occurred trying to update the user's tutorial position to ${this
                  .maxPosition}.`,
                err
              );
            });
        }

        // we've finished the tutorial, so ensure the user is moved past the "watch tutorial" step
        if (this.maxPosition >= this.video.duration) {
          this.logger.info(
            `The user's max position in the tutorial (${this
              .maxPosition}) is now equal to or greater than the video's duration (${this
              .video.duration}).`
          );
          if (this.intervalId) {
            this.logger.info(`Clearing position reporting timer`);
            clearInterval(this.intervalId);
          }
          this.setTutorialFlag();
        }
      }, 5000);
    }
  }

  handleSeek() {
    // if the user tried to seek past the max position, prevent them from doing so
    const delta = this.video.currentTime - this.maxPosition;
    if (delta > 0 && Math.abs(delta) > 0.01) {
      console.log("Seeking is disabled");
      this.video.currentTime = this.maxPosition;
    }
  }

  handleCompletion() {
    this.logger.info(
      `Video has completed. Setting max position to ${this.video.duration}.`
    );
    this.maxPosition = this.video.duration;
  }

  updateProgress() {
    // update max position, if necessary
    if (!this.video.seeking && this.video.currentTime > this.maxPosition) {
      this.maxPosition = this.video.currentTime;
    }

    // update progress based on max position
    this.progressPercentage = this.maxPosition / this.video.duration * 100;
  }

  setTutorialFlag() {
    this.logger.info(`Tutorial completed. Max position = ${this.maxPosition}.`);
    this.tutorialCompleted = true;

    // if the progress reporting timer is running, stop it
    if (this.intervalId) {
      this.logger.info(`Clearing position reporting timer`);
      clearInterval(this.intervalId);
    }

    // if the user's tutorial flag is still set, we can turn it off now
    if (!this.user.hasWatchedTutorial)
      this.httpClient
        .fetch(config.contributorApiUrls.updateOnboardingDetails, {
          mode: "cors",
          method: "post",
          body: json({
            current_step_id: 3,
            no_of_initial_videos_uploaded: 0,
            has_signed_contract: null
          })
        })
        .then(resp => {
          if (!resp.ok) {
            this.logger.error(
              `An error occurred during the call to indicate the user has watched the tutorial.`
            );
          }
        })
        .catch(err => {
          this.logger.error(
            `An error occurred trying to indicate the user has watched the tutorial.`,
            err
          );
        });

    // go to uploads automatically
    this.goToUploads();
  }

  handleFileUploadCompletion(completedFile) {
    this.logger.info(`Completed upload of file ${completedFile.name}.`);
    if (completedFile.isRelease) {
      this.logger.info(
        `File ${completedFile.name} is a release. Initial upload count is not being incremented.`
      );
      return;
    }

    this.numClipsUploaded++;
    this.logger.info(`Initial upload count is now ${this.numClipsUploaded}.`);

    // call the server to increment the count in the database
    // this.httpClient.fetch('/users/initialClips/count', {
    /// if number of clips uploaded 10 clips, send step = 4, else 3.
    var calculatedStepId = 3;
      if (this.numClipsUploaded === 10) {
        calculatedStepId = 4;
      }

    this.httpClient
      .fetch(config.contributorApiUrls.updateOnboardingDetails, {
        mode: "cors",
        method: "post",
        body: json({
          current_step_id: calculatedStepId,
          no_of_initial_videos_uploaded: this.numClipsUploaded,
          has_signed_contract: null
        })
      })
      .then(resp => {
        if (!resp.ok) {
          this.logger.error(
            `An error during the call to update the clip count to ${this
              .numClipsUploaded}.`
          );
        }
      })
      .catch(err => {
        this.logger.error(
          `An error occurred trying to update the clip count to ${this
            .numClipsUploaded}.`,
          err
        );
      });

    if (this.uploadsCompleted) {
      this.logger.info(
        `The final upload has completed (clips uploaded = ${this
          .numClipsUploaded}).`
      );
      this.goToCompletionNotice();
    }
  }

  goToTutorial() {
    console.log("Going to tutorial");
    this.logger.info("Navigating to tutorial step.");
    this.step = 1;
  }

  goToUploads() {
    console.log("Going to Upload");
    this.logger.info("Navigating to uploads step.");
    this.step = 2;
  }

  goToCompletionNotice() {
    this.logger.info("Navigating to completion notice.");
    this.step = 3;
  }

  logout() {
    if (this.intervalId) {
      this.logger.info(`Clearing position reporting timer`);
      clearInterval(this.intervalId);
    }
    this.user.logout();
  }
}
