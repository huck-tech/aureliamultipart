var apiUrl;
var webUrl;
var config = {};
var bucket;
var subdomain;
// var remoteDirectory;
var clipProxyPrefix;
var clipThumbPrefix;
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    apiUrl = 'https://mp-api.clippn.com/';
    bucket = 'clippn-test-mja/new-uploads/';
    subdomain = 'Dashboard'
} 


config = {
    apiUrl: apiUrl,
    subdomain: subdomain,
    webUrl: webUrl,
    clipProxyPrefix : clipProxyPrefix,
    clipThumbPrefix: clipThumbPrefix,
    // remoteDirectory: remoteDirectory,
    tutorialVideoUrl: 'https://player.vimeo.com/external/169419010.hd.mp4?s=9fb1716c9695436e220bea41f002c736ef819302&profile_id=174'
};

// aurelia-auth config
config.auth = {
    baseUrl: config.apiUrl,
    registrationUrl: '/#/register',
    loginUrl: '/accounts/v2/login/',
    loginRedirect: '/#',
    logoutRedirect: '/#/login'
};

// Accounts module urls
config.accountsApiUrls = {
    signupUrl: 'accounts/v2/ctbsignup/',
    activateEmailUrl: 'accounts/v2/activate/',
    resendActivationEmailUrl: 'accounts/v2/resendemail/',
    loginUrl: 'accounts/v2/login/',
    forgotPasswordViewUrl: 'accounts/v2/forgotpassword/',
    forgotPasswordLinkUrl: 'accounts/v2/forgotpasswordlink/',
    refreshTokenUrl: 'accounts/v2/refresh/',
    userDataFetchUrl: 'user/v2/userdetails/',
    contactFormUrl: 'accounts/v2/contactform/',
    checkForFailedUploadsUrl: 'accounts/v2/faileduploads/'
};

config.contributorApiUrls = {
    contractDetailsUrl : 'user/v2/contractdetails/',
    paymentTokenFetchUrl: 'user/v2/acquirebraintreetoken/',
    contractPaymentUrl: 'user/v2/makepayment/',
    tutorialVideoWatchUrl: 'user/v2/updateseconds/',
    updateOnboardingDetails: 'user/v2/updateonboarding/',
    userDataFetchUrl: 'accounts/v2/user/',
    userContactUpdate: 'user/v2/updatecontact/',
    userPaymentSetupUrl: 'user/v2/userpaymentsetupurl/',
    userPaymentHistoryUrl: 'user/v2/userpaymenthistoryurl/',
    userAdditionInfoUrl: 'user/v2/updatectbprofile/',
    userDashboardInfoUpdateUrl: 'user/v2/updatedashboardprofile/',
    userShotSuggestions: 'user/v2/ctbshotsuggestions/'
};

config.packageApiUrls = {
    networkTime: "package/v2/networktime/",
    packageCreateUrl : "package/v2/createpackage/",
    packageErrorUrl :  "package/v2/errorpackage/",
    packageUpdateUrl : "package/v2/updatepackage/",
    fileCompletionUrl: "package/v2/filecomplete/",
    assetUpdateUrl : "package/v2/updateasset/",
    countUrl : "package/v2/packagecount/",
    getPackages : "package/v2/packagesearch/"
};

config.summaryUrls = {
    clipSummaryUrl : "summary/v2/clipsummary/",
    rawClipSummaryUrl : "summary/v2/rawclipsummary/",
    feedbackUrl : "summary/v2/feedback/",
    getSalesUrl: "summary/v2/salesdata/"
};

config.infoUrls = {
    categoriesUrl : "info/v1/categories/",
    distributorsUrl : "info/v1/distributors/",
    shotsuggestionUrl : "info/v1/shotsuggestions/"
}

// evaporate S3 config
config.s3 = {
    baseUrl: 'https://s3.amazonaws.com',
    // baseUrl: 'https://s3-accelerate.amazonaws.com',
    //baseUrl: 'http://192.168.16.129:9444/s3',
    accessKey: 'AKIAI7ASNXB7JKR2EVJA',
    // bucket: 'clippn-contributors-raw-clips',
    // bucket: 'test-clippn-contributors-raw-clips',
    bucket: bucket,
    //bucket: 'clippn-attachments',
    signerUrl: config.apiUrl + 'package/v2/signs3urluploads/sign',
    concurrentFiles: 10,
    concurrentParts: 6,
    maxAttemptsPerPart: 3,
    partSize: 20 * 1024 * 1024, // 50 MB parts
    xhrLogging: false
};


export default config;