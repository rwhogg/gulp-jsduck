var gulp = require("gulp");
var GJSDuck = require("./index.js");
var gjsduck = new GJSDuck(["--out", "docs"]);
var jscs = require("gulp-jscs");
var rimraf = require("rimraf").sync;

gulp.task("test", function() {
    rimraf("docs");
    gulp.src("index.js")
        .pipe(gjsduck.doc());
    console.log("Go check to make sure it's good!");
});

gulp.task("lint", function() {
    gulp.src("index.js")
        .pipe(jscs())
        .pipe(jscs.reporter());
});
