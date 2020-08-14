var pgLanguage = {};
var i18nOptions = {
  resGetPath: 'i18n/__lng__/__ns__.json',
  fallbackLng: 'dev'
};
function fillLanguage() {
  pgLanguage = {
    english: {
      installDocIntro: i18n.t("common.installDocIntro"),
      installDocDescription: i18n.t("common.installDocDescription"),
      installGuideLinkText: i18n.t("common.installGuideLinkText"),
      docWindowsLocation: i18n.t("webDeployment.docWindowsLocation"),
      installLinux: i18n.t("webDeployment.installLinux"),
      docMacLocation: i18n.t("webDeployment.docMacLocation"),
      docLinuxLocation: i18n.t("webDeployment.docLinuxLocation"),
      trayIconGuideLinkText: i18n.t("webDeployment.trayIconGuideLinkText"),
      trayIconGuideLocation: i18n.t("webDeployment.trayIconGuideLocation"),
      rootLabel: i18n.t("webDeployment.rootLabel"),
      localFilesNameHeader: i18n.t("webDeployment.localFilesNameHeader"),
      localFilesModifiedHeader: i18n.t("webDeployment.localFilesModifiedHeader"),
      localFilesSizeHeader: i18n.t("webDeployment.localFilesSizeHeader"),
      listEmpty: i18n.t("webDeployment.listEmpty"),
      queueEmpty: i18n.t("webDeployment.queueEmpty"),
      controlAreaUploadButton: i18n.t("webDeployment.controlAreaUploadButton"),
      controlAreaDownloadButton: i18n.t("webDeployment.controlAreaDownloadButton"),
      controlAreaTransferButton: i18n.t("webDeployment.controlAreaTransferButton"),
      clearQueueButton: i18n.t("webDeployment.clearQueueButton"),
      removeSelectedButton: i18n.t("webDeployment.removeSelectedButton"),
      addFilesButton: i18n.t("webDeployment.addFilesButton"),
      headingLocal: i18n.t("webDeployment.headingLocal"),
      headingRemote: i18n.t("webDeployment.headingRemote"),
      headingEmail: i18n.t("webDeployment.headingEmail"),
      labelEmail: i18n.t("webDeployment.labelEmail"),
      helpEmail: i18n.t("webDeployment.helpEmail"),
      labelMessage: i18n.t("webDeployment.labelMessage"),
      placeholderEmail: i18n.t("webDeployment.placeholderEmail"),
      labelIncludeFiles: i18n.t("webDeployment.labelIncludeFiles"),
      transferQueueMultiplesExistMessage: i18n.t("webDeployment.transferQueueMultiplesExistMessage"),
      transferQueueExistsMessage: i18n.t("webDeployment.transferQueueExistsMessage"),
      transferCompleteMessage: i18n.t("webDeployment.transferCompleteMessage"),
      transferCancelledMessage: i18n.t("webDeployment.transferCancelledMessage"),
      transferErrorMessage: i18n.t("webDeployment.transferErrorMessage"),
      filterFailFileMessage: i18n.t("webDeployment.filterFailFileMessage"),
      directoriesNotAllowedMessage: i18n.t("webDeployment.directoriesNotAllowedMessage"),
      existingQueueFailureMessage: i18n.t("webDeployment.existingQueueFailureMessage"),
      maxFilesExceededMessage: i18n.t("webDeployment.maxFilesExceededMessage"),
      fileSizeMaxExceededMessage: i18n.t("webDeployment.fileSizeMaxExceededMessage"),
      fileSizeMinUnmetMessage: i18n.t("webDeployment.fileSizeMinUnmetMessage"),
      filenameRegexFailMessage: i18n.t("webDeployment.filenameRegexFailMessage"),
      fileSizeTotalExceededMessage: i18n.t("webDeployment.fileSizeTotalExceededMessage"),
      fileTransferError: i18n.t("webDeployment.fileTransferError"),
      fileTransferErrorStatus: i18n.t("webDeployment.fileTransferErrorStatus"),
      findLogsMessage: i18n.t("webDeployment.findLogsMessage"),
      statusSuccessPercentComplete: i18n.t("webDeployment.statusSuccessPercentComplete"),
      statusCancelledPercentComplete: i18n.t("webDeployment.statusCancelledPercentComplete"),
      statusErrorPercentComplete: i18n.t("webDeployment.statusErrorPercentComplete"),
      emailSentMessage: i18n.t("webDeployment.emailSentMessage"),
      emailMessageHeaderAdmin: i18n.t("webDeployment.emailMessageHeaderAdmin"),
      emailMessageHeaderUser: i18n.t("webDeployment.emailMessageHeaderUser"),
      months: i18n.t("webDeployment.months").split(" "),
      lostConnectionFatal: i18n.t("webDeployment.lostConnectionFatal") + i18n.t("webDeployment.lostConnectionIfAutoResume"),
      agentNotFoundMsg: i18n.t("webDeployment.agentNotFoundMsg"),
      agentNotFoundTitle: i18n.t("webDeployment.agentNotFoundTitle"),
      agentNotFoundButtonCancel: i18n.t("webDeployment.agentNotFoundButtonCancel"),
      agentNotFoundButtonDownload: i18n.t("webDeployment.agentNotFoundButtonDownload"),
      agentNotFoundButtonConfirm: i18n.t("webDeployment.agentNotFoundButtonConfirm"),
      agentNotFoundDownloadMsg: i18n.t("webDeployment.agentNotFoundDownloadMsg"),
      agentNotFoundCancel: i18n.t("webDeployment.agentNotFoundCancel"),
      downloadButtonLabel: i18n.t("webDeployment.downloadButtonLabel"),
      downloadButtonNoFiles: i18n.t("webDeployment.downloadButtonNoFiles"),
      portNotFoundMsg: i18n.t("webDeployment.portNotFoundMsg"),
      portNotFoundTitle: i18n.t("webDeployment.portNotFoundTitle"),
      portNotFoundFieldLabel: i18n.t("webDeployment.portNotFoundFieldLabel"),
      portNotFoundButtonRetry: i18n.t("webDeployment.portNotFoundButtonRetry"),
      portNotFoundButtonConfirm: i18n.t("webDeployment.portNotFoundButtonConfirm"),
      portNotFoundButtonCancel: i18n.t("webDeployment.portNotFoundButtonCancel"),
      portNotFoundCancel: i18n.t("webDeployment.portNotFoundCancel"),
      errorRemoteNotConfiguredMsg: i18n.t("webDeployment.errorRemoteNotConfiguredMsg"),
      errorConnectingMsg: i18n.t("webDeployment.errorConnectingMsg"),
      errorConnectingRemoteMsg: i18n.t("webDeployment.errorConnectingRemoteMsg"),
      errorConnectingButton: i18n.t("webDeployment.errorConnectingButton"),
      errorNotLicensedMsg: i18n.t("webDeployment.errorNotLicensedMsg"),
      errorServerExpiredMsg: i18n.t("webDeployment.errorServerExpiredMsg"),
      errorNotLicensedMsgShort: i18n.t("webDeployment.errorNotLicensedMsgShort"),
      errorServerExpiredMsgShort: i18n.t("webDeployment.errorServerExpiredMsgShort"),
      errorInvalidOrigin: i18n.t("webDeployment.errorInvalidOrigin"),
      errorInvalidOriginShort: i18n.t("webDeployment.errorInvalidOriginShort"),
      supplyCredentialsMsg: i18n.t("webDeployment.supplyCredentialsMsg"),
      checkCredentialsMsg: i18n.t("webDeployment.checkCredentialsMsg"),
      credentialsDialogTitle: i18n.t("webDeployment.credentialsDialogTitle"),
      manualConfigCancel: i18n.t("webDeployment.manualConfigCancel"),
      formlabelUsername: i18n.t("webDeployment.formlabelUsername"),
      formlabelPassword: i18n.t("webDeployment.formlabelPassword"),
      errorAgentAbsent: i18n.t("webDeployment.errorAgentAbsent"),
      autoDetectCancelButton: i18n.t("webDeployment.autoDetectCancelButton"),
      cancelTransferButton: i18n.t("webDeployment.cancelTransferButton"),
      revealPathButton: i18n.t("webDeployment.revealPathButton"),
      manualConfigMsg: i18n.t("webDeployment.manualConfigMsg"),
      manualConfigTitle: i18n.t("webDeployment.manualConfigTitle"),
      manualConfigCheckLabel: i18n.t("webDeployment.manualConfigCheckLabel"),
      manualConfigInstallRequired: i18n.t("webDeployment.manualConfigInstallRequired"),
      manualConfigInstructionDownload: i18n.t("webDeployment.manualConfigInstructionDownload"),
      manualConfigInstructionLaunch: i18n.t("webDeployment.manualConfigInstructionLaunch"),
      manualConfigInstructionPort: i18n.t("webDeployment.manualConfigInstructionPort"),
      manualConfigInstructionDone: i18n.t("webDeployment.manualConfigInstructionDone"),
      manualLaunchTitle: i18n.t("webDeployment.manualLaunchTitle"),
      manualLaunchMsg: i18n.t("webDeployment.manualLaunchMsg"),
      manualLaunchMsgLinux: i18n.t("webDeployment.manualLaunchMsgLinux"),
      manualLaunchTryAgain: i18n.t("webDeployment.manualLaunchTryAgain"),
      manualLaunchDownload: i18n.t("webDeployment.manualLaunchDownload"),
      manualLaunchButton: i18n.t("webDeployment.manualLaunchButton"),
      manualLaunchRememberLabel: i18n.t("webDeployment.manualLaunchRememberLabel"),
      manualLaunchAdvancedLabel: i18n.t("webDeployment.manualLaunchAdvancedLabel"),
      downloadNotify: i18n.t("webDeployment.downloadNotify"),
      upgradeNotify: i18n.t("webDeployment.upgradeNotify"),
      queueNoFiles: i18n.t("webDeployment.queueNoFiles"),
      queueNoClear: i18n.t("webDeployment.queueNoClear"),
      queueNoSelect: i18n.t("webDeployment.queueNoSelect"),
      retryDialogMsg: i18n.t("webDeployment.retryDialogMsg"),
      internetExplorerConfig: i18n.t("webDeployment.internetExplorerConfig"),
      upgradeJSisNewer: i18n.t("webDeployment.upgradeJSisNewer"),
      upgradeTitle: i18n.t("webDeployment.upgradeTitle"),
      doNotShowAgainCheckbox: i18n.t("webDeployment.doNotShowAgainCheckbox"),
      rememberCredentialsCheckbox: i18n.t("webDeployment.rememberCredentialsCheckbox"),
      generalLearnMoreText: i18n.t("webDeployment.generalLearnMoreText"),
      errorsListMessage: i18n.t("webDeployment.errorsListMessage"),
      errorsMoreMessage: i18n.t("webDeployment.errorsMoreMessage"),
      errorNotAccessibleMessage:i18n.t("webDeployment.errorsResourceNotAccessibleMessage"),
      warningOnNavigate: i18n.t("webDeployment.warningOnNavigate"),
      warningLaunchFailed: i18n.t("common.warningLaunchFailed"),
      launchFailRefreshButton: i18n.t("webDeployment.launchFailRefreshButton"),
      "downloadPathInfoTitle": i18n.t("webDeployment.downloadPathInfoTitle"),
      "downloadPathInfoConfirmButton": i18n.t("downloadPathInfoConfirmButton"),
      "downloadPathInfoIntroduction": i18n.t("downloadPathInfoIntroduction"),
      "downloadPathInfoAdditional": i18n.t("downloadPathInfoAdditional"),
      "upgradeButtonIgnore": i18n.t("webDeployment.upgradeButtonIgnore"),
      tooltips: {
        selectAll: i18n.t("webDeployment.tooltips.selectAll"),
        yes: i18n.t("webDeployment.tooltips.yes"),
        no: i18n.t("webDeployment.tooltips.no"),
        removeCredentialsWarning: i18n.t("webDeployment.tooltips.removeCredentialsWarning")
      },
      spinner: {
        detectPort: i18n.t("webDeployment.spinner.detectPort"),
        connecting: i18n.t("webDeployment.spinner.connecting"),
        heartbeat: i18n.t("webDeployment.spinner.heartbeat"),
        launch: i18n.t("webDeployment.spinner.heartbeat"),
        waiting: i18n.t("webDeployment.spinner.waiting"),
        initializing: i18n.t("webDeployment.spinner.initializing")
      },
      statusFields: {
        current: {
          heading: '', // if overall.heading is blank, serves as a heading for both
          // heading: 'Current File Status', // un-comment this to add a header above the status update area
          actualRate: i18n.t("webDeployment.statusFields.current.actualRate"),
          bytesSoFarAllFiles: i18n.t("webDeployment.statusFields.current.bytesSoFarAllFiles"),
          bytesSoFarCurrentFile: i18n.t("webDeployment.statusFields.current.bytesSoFarCurrentFile"),
          connected: i18n.t("webDeployment.statusFields.current.connected"),
          currentFilename: i18n.t("webDeployment.statusFields.current.currentFilename"),
          currentFileTimeRemaining: i18n.t("webDeployment.statusFields.current.currentFileTimeRemaining"),
          currentPercent: i18n.t("webDeployment.statusFields.current.currentPercent"),
          currentRate: i18n.t("webDeployment.statusFields.current.currentRate"),
          filesSoFar: i18n.t("webDeployment.statusFields.current.filesSoFar"),
          overallTimeRemaining: i18n.t("webDeployment.statusFields.current.overallTimeRemaining"),
          packetLossPercent: i18n.t("webDeployment.statusFields.current.packetLossPercent"),
          percent: i18n.t("webDeployment.statusFields.current.percent"),
          percentBar: i18n.t("webDeployment.statusFields.current.percentBar"),
          rateAverage: i18n.t("webDeployment.statusFields.current.rateAverage"),
          statusMessage: i18n.t("webDeployment.statusFields.current.statusMessage"),
          rateAverageInKBperSecond: i18n.t("webDeployment.statusFields.current.rateAverageInKBperSecond"),
          remoteServer: i18n.t("webDeployment.statusFields.current.remoteServer"),
          rTT: i18n.t("webDeployment.statusFields.current.rTT"),
          sizeAllFiles: i18n.t("webDeployment.statusFields.current.sizeAllFiles"),
          sizeCurrentFile: i18n.t("webDeployment.statusFields.current.sizeCurrentFile"),
          sizeTransferredAlreadyAllFiles: i18n.t("webDeployment.statusFields.current.sizeTransferredAlreadyAllFiles"),
          sizeTransferredAlreadyCurrentFile: i18n.t("webDeployment.statusFields.current.sizeTransferredAlreadyCurrentFile"),
          timeRemaining: i18n.t("webDeployment.statusFields.current.timeRemaining"),
          totalFiles: i18n.t("webDeployment.statusFields.current.totalFiles"),
          throughputRate: i18n.t("webDeployment.statusFields.current.throughputRate"),
          transferCancelled: i18n.t("webDeployment.statusFields.current.transferCancelled"),
          transferComplete: i18n.t("webDeployment.statusFields.current.transferComplete"),
          transferTime: i18n.t("webDeployment.statusFields.current.transferTime"),
          transferDirection: i18n.t("webDeployment.statusFields.current.transferDirection")
        },
        overall: {
          heading: '', // title appearing above the 'overall' status fields. Leave blank to visually join the two
          // heading: 'Overall Transfer Status', // un-comment this line to divide the areas with a header
          destinationPath: i18n.t("webDeployment.statusFields.overall.destinationPath"),
          actualRate: i18n.t("webDeployment.statusFields.overall.actualRate"),
          bytesSoFarAllFiles: i18n.t("webDeployment.statusFields.overall.bytesSoFarAllFiles"),
          connected: i18n.t("webDeployment.statusFields.overall.connected"),
          currentPercent: i18n.t("webDeployment.statusFields.overall.currentPercent"),
          currentRate: i18n.t("webDeployment.statusFields.overall.currentRate"),
          filesSoFar: i18n.t("webDeployment.statusFields.overall.filesSoFar"),
          numberOfActiveTransfers: i18n.t("webDeployment.statusFields.overall.numberOfActiveTransfers"),
          overallTimeRemaining: i18n.t("webDeployment.statusFields.overall.overallTimeRemaining"),
          packetLossPercent: i18n.t("webDeployment.statusFields.overall.packetLossPercent"),
          percent: i18n.t("webDeployment.statusFields.overall.percent"),
          percentBar: i18n.t("webDeployment.statusFields.overall.percentBar"),
          rateAverage: i18n.t("webDeployment.statusFields.overall.rateAverage"),
          rateAverageInKBperSecond: i18n.t("webDeployment.statusFields.overall.rateAverageInKBperSecond"),
          remoteServer: i18n.t("webDeployment.statusFields.overall.remoteServer"),
          rTT: i18n.t("webDeployment.statusFields.overall.rTT"),
          sizeAllFiles: i18n.t("webDeployment.statusFields.overall.sizeAllFiles"),
          sizeTransferredAlreadyAllFiles: i18n.t("webDeployment.statusFields.overall.sizeTransferredAlreadyAllFiles"),
          totalFiles: i18n.t("webDeployment.statusFields.overall.totalFiles"),
          throughputRate: i18n.t("webDeployment.statusFields.overall.throughputRate"),
          transferCancelled: i18n.t("webDeployment.statusFields.overall.transferCancelled"),
          transferComplete: i18n.t("webDeployment.statusFields.overall.transferComplete"),
          transferDirection: i18n.t("webDeployment.statusFields.overall.transferDirection"),
          transferFinished: i18n.t("webDeployment.statusFields.overall.transferFinished"),
          transferID: i18n.t("webDeployment.statusFields.overall.transferID"),
          transferTime: i18n.t("webDeployment.statusFields.overall.transferTime"),
          transferMode: i18n.t("webDeployment.statusFields.overall.transferMode")
        }
      }
    }
  };
}

