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

var Class = require("yajscf");
var JSDuck = require("jsduck-from-js");
var through = require("through2");
var gutil = require("gulp-util");
var PluginError = gutil.PluginError;
var _ = require("underscore");

const PLUGIN_NAME = "gulp-jsduck";

/**
 * @class GulpJSDuck
 * GulpJSDuck is a Gulp plugin for [jsduck](https://github.com/senchalabs/jsduck)
 * It supports all the options the command-line version does
 */
module.exports = Class.extend(
{
    /**
     * @method constructor
     * @param {String[]} options Array of options to pass to the JSDuck gem
     * @throws {PluginError} If we cannot find the jsduck binary
     */
    init: function(options)
    {
        try
        {
            /**
             * @property {JSDuck} jsduck
             * JSDuck wrapper
             * @private
             */
            this.jsduck = new JSDuck(options);
        }
        catch(e)
        {
            throw new PluginError(PLUGIN_NAME, "could not find the JSDuck binary!");
        }

        // since JSDuck overwrites index.html each time we execute it, we don't output right away.
        // instead, we collect the file names and schedule the output before Node.js exits.
        /**
         * @property {String[]} paths
         * List of paths to make documentation for
         * @private
         */
        this.paths = [];
        process.on("beforeExit", _.bind(function()
        {
            this.jsduck.doc(this.paths);
        }, this));
    },

    /**
     * Pipe data to this function to get JSDoc output
     */
    doc: function()
    {
        var stream = through.obj(_.bind(function(file, encoding, callback)
        {
            this.paths.push(file.relative);
        }, this));

        // pass the file to the next plugin
        this.push(file);
        callback();
        return stream;
    }
});
