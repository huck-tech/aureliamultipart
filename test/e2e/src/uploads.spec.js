// import { PageObjectSkeleton } from "./skeleton.po.js";
const dropFile = require("./files_for_upload.js");
const EC = protractor.ExpectedConditions;
const path = require("path");
const nock = require("nock");
const AWS = require("aws-sdk");
const config = require('../test-files/config.js');

describe("UploadComponent", () => {
  // let poSkeleton;

  beforeEach(done => {
    console.log("before each");
    // poSkeleton = new PageObjectSkeleton();
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
    done();
    // browser.ignoreSynchronization = true;
  });

  it("should load the page and display the initial page title", done => {
    console.log("title");
    browser.loadAndWaitForAureliaPage("http://localhost:9000/#/dashboard");
    expect(browser.getTitle()).toBe("Login | Clippn");
    done();
  });

  it("should login successfully", done => {
    console.log("login");
    element(by.id("e-mail")).sendKeys("mjabraham5151@gmail.com");
    element(by.id("password")).sendKeys(config.password);
    browser.driver.findElement(by.id("login-to-dashboard")).click();
    browser.sleep(3000);
    expect(browser.getTitle()).toBe("Home | Dashboard | Dashboard | Clippn");
    done();
  });

  it("should retrieve clips for dashboard", done => {
    browser.sleep(5000);
    let clips;
    browser.driver
      .findElement(by.id("clips-total"))
      .getText()
      .then(function(text) {
        clips = text;
        done();
        expect(parseInt(clips)).toEqual(jasmine.any(Number));
      });
  });

  it("should retrieve clips for clips page", done => {
    let clips;
    browser.driver.findElement(by.id("clips")).click();
    browser.sleep(12000);
    browser.driver
      .findElement(by.id("clips-total"))
      .getText()
      .then(function(text) {
        let clipsTotalArray = text.split(" ");
        clips = clipsTotalArray[0];
        done();
        expect(parseInt(clips)).toEqual(jasmine.any(Number));
      });
  });

  it("should retrieve uploads on uploads page", done => {
    let uploads;
    browser.driver.findElement(by.id("uploads")).click();
    browser.sleep(12000);
    browser.driver
      .findElement(by.id("uploads-total"))
      .getText()
      .then(function(text) {
        let uploadsTotalArray = text.split(" ");
        uploads = uploadsTotalArray[0];
        done();
        expect(parseInt(uploads)).toEqual(jasmine.any(Number));
      });
  });

  it("should add folder to upload modal -- first stage", done => {
    browser.driver.findElement(by.id("upload-clips")).click();
    browser.driver.findElement(by.id("folderRadio")).click();
    let folderToUpload = "../../test-files";
    let absolutePath = path.resolve(__dirname, folderToUpload);
    browser.driver
      .findElement(by.id("uploadClipSelector"))
      .sendKeys(absolutePath);
    // browser.driver.findElement(by.css('input[type="file"]')).sendKeys(absolutePath);
    element(by.id("upload-button-step-1")).click();
    browser.sleep(5000);
    done();
    expect(
      browser.driver
        .findElement(by.id("m-progress-current"))
        .getText()
        .toBe("2")
    );
  });

  // it("should upload folder to actual test s3 -- second and third stage", done => {
  //   element(by.id("upload-button-step-2")).click();
  //   element(by.id("packageName")).sendKeys("test-name");
  //   element(by.id("packageDescription")).sendKeys("test-desc");
  //   element(by.id("upload-button-step-3")).click();
  //   browser.sleep(5000);
  //   element(by.id("upload-modal-close")).click();
  //   browser.sleep(80000);

  //   done();
  //   expect(
  //     browser.driver
  //       .findElement(by.css(".upload-complete"))
  //       .getText()
  //       .toContain("Complete")
  //   );
  // });

  it("should upload folder to nock s3 -- second and third stage", done => {
    var REGION = "us-east-1";

    AWS.config.update({
      region: REGION,
      sslEnabled: true,
      logger: console,
      accessKeyId: config.AWS_ACCESS_KEY,
      secretAccessKey: config.AWS_SECRET_KEY
    });

    var bucket = new AWS.S3({
      apiVersion: "2006-03-01",
      params: {
        Bucket: "clippn-test-mja"
      }
    });
    nock('https://clippn-mja-test.s3.amazonaws.com').put('/new-uploads/').reply(200)

    element(by.id("upload-button-step-2")).click();
    element(by.id("packageName")).sendKeys("test-name");
    element(by.id("packageDescription")).sendKeys("test-desc");
    element(by.id("upload-button-step-3")).click();
    browser.sleep(5000);
    element(by.id("upload-modal-close")).click();
    browser.sleep(80000);

    done();
    expect(
      browser.driver
        .findElement(by.css(".upload-complete"))
        .getText()
        .toContain("Complete")
    );
  });
});
