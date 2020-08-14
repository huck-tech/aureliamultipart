import "bootstrap";
import "fetch";

import { validate } from "validate.js";
import { ValidationRules, ValidationRule } from "aurelia-validatejs";
import moment from "moment";
import { LogManager } from "aurelia-framework";
import { FetchConfig } from "aurelia-auth";
import { HttpClient } from "aurelia-fetch-client";
import config from "app-config";
import {
  LabelAdjacentValidationRenderer,
  RegisterValidationRenderer
} from "helpers/validation-renderers";
import { ApiLogAppender } from "api-log-appender";
// import {log} from "./log";
import {ConsoleAppender} from "aurelia-logging-console";

export function subdomainIsCorporate() {
  return window.location.host.split('.')[0] === 'bloomberg' ? true : false
}

export function configure(aurelia) {
  const cfg = aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .plugin("aurelia-validation")
    .plugin("aurelia-validatejs")
    .plugin("aurelia-dialog")
    .plugin("aurelia-bootstrap-datepicker")
    .plugin('aurelia-utility-converters')    
    .plugin("aurelia-auth", baseConfig => {
      baseConfig.configure(config.auth);
    })

  cfg.container.registerHandler("label-adjacent", container =>
    container.get(LabelAdjacentValidationRenderer)
  );
  cfg.container.registerHandler("register", container =>
    container.get(RegisterValidationRenderer)
  );
  LogManager.addAppender(new ConsoleAppender());
  
  LogManager.addAppender(cfg.container.get(ApiLogAppender));
  LogManager.setLevel(LogManager.logLevel.error);

  aurelia.start().then(a => a.setRoot("app"));
}

validate.validators.strongPassword = function(value) {
  const regex = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9 ]).{8,}$",
    "g"
  );
  if (!regex.test(value))
    return "should be at least 8 characters and contain at least one lowercase letter, uppercase letter, number, and special character.";
  return null;
};

ValidationRules.prototype.strongPassword = function strongPassword() {
  this.addRule(
    this.currentProperty,
    new ValidationRule("strongPassword", true)
  );
  return this;
};

validate.validators.dateGreaterThan = function(value, options, propName, obj) {
  if (
    value &&
    obj[options.name] &&
    moment.utc(value) <= moment.utc(obj[options.name])
  )
    return `must be later than ${options.displayName}`;
  return null;
};

ValidationRules.prototype.dateGreaterThan = function dateGreaterThan(cfg) {
  this.addRule(
    this.currentProperty,
    new ValidationRule("dateGreaterThan", cfg)
  );
  return this;
};

validate.validators.dateLessThan = function(value, options, propName, obj) {
  if (
    value &&
    obj[options.name] &&
    moment.utc(value) >= moment.utc(obj[options.name])
  )
    return `must be earlier than ${options.displayName}`;
  return null;
};

ValidationRules.prototype.dateLessThan = function dateLessThan(cfg) {
  this.addRule(this.currentProperty, new ValidationRule("dateLessThan", cfg));
  return this;
};

// Before using it we must add the parse and format functions
// Here is a sample implementation using moment.js
validate.extend(validate.validators.datetime, {
  // The value is guaranteed not to be null or undefined but otherwise it
  // could be anything.
  parse: function(value, options) {
    return moment.utc(value);
  },
  // Input is a unix timestamp
  format: function(value, options) {
    var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD hh:mm:ss";
    return moment.utc(value).format(format);
  }
});

window.onbeforeunload = function() {
  if (window.isUploading) {
    //$('#uploadsInProgress').modal('show');
    return "You still have uploads in progress. Leaving the page will cancel these uploads. Are you sure you want to leave?";
  }
};
