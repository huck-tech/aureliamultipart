// An example configuration file.
exports.config = {
  directConnect: true,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    browserName: "chrome"
  },

  // optional: add seleniumServerJar with proper version number
  // seleniumServerJar: './node_modules/gulp-protractor/node_modules/protractor/selenium/selenium-server-standalone-2.53.1.jar',

  // specs: ['test/e2e/dist/**/*.js'], NOTE - see the e2e gulp task for specifying specs location

  plugins: [
    {
      package: "aurelia-protractor-plugin"
    }
  ],
  // seleniumServerJar: "./test/e2e/selenium-server-standalone-3.8.1.jar",

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};
