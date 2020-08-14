var gulp = require("gulp");
var runSequence = require("run-sequence");
var changed = require("gulp-changed");
var plumber = require("gulp-plumber");
var babel = require("gulp-babel");
var sourcemaps = require("gulp-sourcemaps");
var paths = require("../paths");
var compilerOptions = require("../babel-options");
var assign = Object.assign || require("object.assign");
var notify = require("gulp-notify");
var browserSync = require("browser-sync");
var htmlmin = require("gulp-htmlmin");
var minify = require("gulp-minify");
var cleanCSS = require("gulp-clean-css");
var webpack = require("webpack-stream");
var path = require("path");
const { AureliaPlugin } = require("aurelia-webpack-plugin");
var BrowserSyncPlugin = require("browser-sync-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

// transpiles changed es6 files to SystemJS format
// the plumber() call prevents 'pipe breaking' caused
// by errors from other gulp plugins
// https://www.npmjs.com/package/gulp-plumber
gulp.task("build-system", function() {
  return gulp
    .src(paths.source)
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(changed(paths.output, { extension: ".*" }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(babel(assign({}, compilerOptions("systemjs"))))
    // .pipe(
    //   webpack({
    //     config: {
    //       resolve: {
    //         alias: {
    //           math: path.resolve("./src")
    //         }
    //       },
    //       watch: true,
    //       // context: '/',
    //       entry: ["aurelia-bootstrapper" ],
    //       output: {
    //         path: path.resolve(__dirname, "dist"),
    //         filename: "main.js"
    //       },
    //       loader: {
    //         test: /\.js$/,
    //         use: [
    //           {
    //             loader: [{ loader: "babel-loader" }],
    //             options: { presets: ["env"] }
    //           }
    //         ]
    //       },
    //       plugins: [
    //         new AureliaPlugin({
    //           dist: "commonjs",
    //           includeAll: path.resolve("./src"),
    //           features: {
    //             polyfills: "es2016"
    //           }
    //         })
    //       ]
    //     }
    //   })
    // )
    .pipe(gulp.dest(paths.output));
});

// copies changed html files to the output directory
gulp.task("build-html", function() {
  return gulp
    .src(paths.html)
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(changed(paths.output, { extension: ".html" }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(paths.output));
});

// copies changed css files to the output directory
gulp.task("build-css", function() {
  return (gulp
      .src(paths.css)
      .pipe(changed(paths.output, { extension: ".css" }))
      // .pipe(cleanCSS({compatibility: 'ie8'}))
      .pipe(gulp.dest(paths.output))
      .pipe(browserSync.stream()) );
});

// gulp.task('compress', function() {
//   gulp.src('src/*.js')
//     .pipe(minify({
//         ext:{
//             src:'-debug.js',
//             min:'.js'
//         },
//         exclude: ['tasks'],
//         ignoreFiles: ['.combo.js', '-min.js']
//     }))
//     .pipe(gulp.dest('dist'))
// });
// this task calls the clean task (located
// in ./clean.js), then runs the build-system
// and build-html tasks in parallel
// https://www.npmjs.com/package/gulp-run-sequence
gulp.task("build", function(callback) {
  return runSequence(
    "clean",
    ["build-system", "build-html", "build-css"],
    callback
  );
});
