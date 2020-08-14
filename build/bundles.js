module.exports = {
  "bundles": {
    "dist/app-build": {
      "includes": [
        "[**/**/*.js]",
        "**/*.html!text",
        "**/*.css!text",
      ],
      "options": {
        "inject": true,
        "minify": true,
        "depCache": true,
        "rev": false
      }
    },
    "dist/aurelia": {
      "includes": [
        "aurelia-framework",
        "aurelia-bootstrapper",
        "aurelia-fetch-client",
        "aurelia-router",
        "aurelia-animator-css", 
        "aurelia-validation",
        "aurelia-validatejs",
        "aurelia-templating-binding",
        "aurelia-polyfills",
        "aurelia-templating",
        "aurelia-templating-resources",
        "aurelia-templating-router",
        "aurelia-loader-default",
        "aurelia-task-queue",
        "aurelia-path",
        "aurelia-route-recognizer",
        "aurelia-event-aggregator",
        "aurelia-history-browser",
        "aurelia-logging-console",
        "bootstrap",
        "bootstrap/css/bootstrap.css!text",
        "fetch",
        "jqueryui",
      ],
      "options": {
        "inject": true,
        "minify": true,
        "depCache": false,
        "rev": false
      }
    }
  }
};
