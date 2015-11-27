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

## License
Copyright © 2015 Bob W. Hogg. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
