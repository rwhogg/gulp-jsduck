# gulp-jsduck

## A gulp plugin for [jsduck](https://github.com/senchalabs/jsduck)

[![Build Status](https://travis-ci.org/rwhogg/gulp-jsduck.svg?branch=master)](https://travis-ci.org/rwhogg/gulp-jsduck)

## Installing

Add gulp-jsduck as a dev dependency:

```bash
$ npm install --save-dev gulp-jsduck;
```

## Usage

gulp-jsduck can be used similarly to other Gulp plugins. Just pipe files to it and it will document them:

```js
var gulp = require("gulp");
var GJSDuck = require("gulp-jsduck");
var gjsduck = new GJSDuck(["--out", "docs"]);

gulp.task("default", function()
{
    gulp.src("src/**.js")
        .pipe(gjsduck.doc());
});
```
