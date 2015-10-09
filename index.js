// Copyright © 2015 Bob W. Hogg. All Rights Reserved.
//
// This file is part of gulp-jsduck.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Based on software with the following license:
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var Class = require("yajscf");
var path = require("path");
var gutil = require("gulp-util");
var through = require("through2");
var objectAssign = require("object-assign");
var file = require("vinyl-file");
var revHash = require("rev-hash");
var revPath = require("rev-path");
var sortKeys = require("sort-keys");
var modifyFilename = require("modify-filename");

function relPath(base, filePath)
{
    if(filePath.indexOf(base) !== 0)
    {
        return filePath.replace(/\\/g, "/");
    }

    var newPath = filePath.substr(base.length).replace(/\\/g, "/");

    if(newPath[0] === "/")
    {
        return newPath.substr(1);
    }

    return newPath;
}

var plugin = function()
{
    var sourcemaps = [];
    var pathMap = {};

    return through.obj(function(file, enc, cb)
    {
        if(file.isNull())
        {
            cb(null, file);
            return;
        }

        if(file.isStream())
        {
            cb(new gutil.PluginError("gulp-rev", "Streaming not supported"));
            return;
        }

        // this is a sourcemap, hold until the end
        if(path.extname(file.path) === ".map")
        {
            sourcemaps.push(file);
            cb();
            return;
        }

        var oldPath = file.path;
        transformFilename(file);
        pathMap[oldPath] = file.revHash;

        cb(null, file);
    }, function(cb)
    {
        sourcemaps.forEach(function(file)
        {
            var reverseFilename;

            // attempt to parse the sourcemap"s JSON to get the reverse filename
            try
            {
                reverseFilename = JSON.parse(file.contents.toString()).file;
            }
            catch(err) {}

            if(!reverseFilename)
            {
                reverseFilename = path.relative(path.dirname(file.path), path.basename(file.path, ".map"));
            }

            if(pathMap[reverseFilename])
            {
                // save the old path for later
                file.revOrigPath = file.path;
                file.revOrigBase = file.base;

                var hash = pathMap[reverseFilename];
                file.path = revPath(file.path.replace(/\.map$/, ""), hash) + ".map";
            }
            else
            {
                transformFilename(file);
            }

            this.push(file);
        }, this);

        cb();
    });
};

plugin.manifest = function(pth, opts)
{
    if(typeof pth === "string")
    {
pth = {path: pth};
    }

    opts = objectAssign(
    {
path: "rev-manifest.json",
merge: false
    }, opts, pth);

    var firstFileBase = null;
    var manifest = {};

    return through.obj(function(file, enc, cb)
    {
        // ignore all non-rev"d files
        if(!file.path || !file.revOrigPath)
        {
            cb();
            return;
        }

        firstFileBase = firstFileBase || file.base;

        var revisionedFile = relPath(firstFileBase, file.path);
        var originalFile = path.join(path.dirname(revisionedFile), path.basename(file.revOrigPath)).replace(/\\/g, "/");

        manifest[originalFile] = revisionedFile;

        cb();
    }, function(cb)
    {
        // no need to write a manifest file if there"s nothing to manifest
        if(Object.keys(manifest).length === 0)
        {
            cb();
            return;
        }

        getManifestFile(opts, function(err, manifestFile)
        {
            if(err)
            {
                cb(err);
                return;
            }

            if(opts.merge && !manifestFile.isNull())
            {
                var oldManifest = {};

                try
                {
                    oldManifest = JSON.parse(manifestFile.contents.toString());
                }
                catch(err) {}

                manifest = objectAssign(oldManifest, manifest);
            }

            manifestFile.contents = new Buffer(JSON.stringify(sortKeys(manifest), null, "  "));
            this.push(manifestFile);
            cb();
        } .bind(this));
    });
};

module.exports = plugin;
