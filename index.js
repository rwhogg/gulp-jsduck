var Class = require("yajscf");
var JSDuck = require("jsduck");
var through = require("through2");
var gutil = require("gulp-util");
var PluginError = gutil.PluginError;

const PLUGIN_NAME = "gulp-jsduck";

/**
 * @class GulpJSDuck
 * GulpJSDuck is a Gulp plugin for [jsduck](https://github.com/senchalabs/jsduck)
 * It supports all the options the command-line version does
 */
module.exports = Class.extend({
    /**
     * @method constructor
     * @param {String[]} options Array of options to pass to the JSDuck gem
     * @throws {PluginError} If we cannot find the jsduck binary
     */
    init: function(options) {
        try {
            /**
             * @property {JSDuck} jsduck
             * JSDuck wrapper
             * @private
             */
            this.jsduck = new JSDuck(options);
        }
        catch(e) {
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
    },

    /**
     * @method doc
     * Pipe data to this function to get JSDoc output
     * @return {Object} The JSDuck stream
     */
    doc: function() {
        var me = this;
        var stream = through.obj(function transform(file, encoding, callback) {
            // collect the file, but don't do anything with it yet
            me.paths.push(file.path);

            // pass the file to the next plugin
            this.push(file);
            callback();
        }, function flush(callback) {
            try {
                var result = me.jsduck.doc(me.paths);
                var output = result.output.toString();
                if(result.status) {
                    // execution failed
                    throw new PluginError(PLUGIN_NAME, output);
                }
                else {
                    console.log(output);
                }
            }
            catch(e) {
                throw new PluginError(PLUGIN_NAME, e.toString());
            }
            callback();
        });
        return stream;
    }
});
