/**
 * A module registration and load library.
 *
 * you can use
 *
 *     modulex.use('overlay,node', function(Overlay, Node){
 *     });
 *
 * to load modules. and use
 *
 *     modulex.add(function(require, module, exports){
 *     });
 *
 * to register modules.
 */
/* exported modulex */
/* jshint -W079 */
var modulex = (function (undefined) {
    // Console-polyfill. MIT license.
// https://github.com/paulmillr/console-polyfill
// Make it safe to do console.log() always.
    (function (con) {
        'use strict';
        var prop, method;
        var empty = {};
        var dummy = function () {
        };
        var properties = 'memory'.split(',');
        var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
            'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
            'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',');
        while ((prop = properties.pop())) {
            con[prop] = con[prop] || empty;
        }
        while ((method = methods.pop())) {
            con[method] = con[method] || dummy;
        }
    })(this.console = this.console || {}); // Using `this` for web workers.

    var mx = {
        /**
         * The build time of the library.
         * NOTICE: '@TIMESTAMP@' will replace with current timestamp when compressing.
         * @private
         * @type {String}
         */
        __BUILD_TIME: '@TIMESTAMP@',

        /**
         * modulex Environment.
         * @type {Object}
         */
        Env: {
            host: this,
            mods: {}
        },

        /**
         * modulex Config.
         * If load modulex.js, Config.debug defaults to true.
         * Else If load modulex-min.js, Config.debug defaults to false.
         * @private
         * @property {Object} Config
         * @property {Boolean} Config.debug
         * @member modulex
         */
        Config: {
            debug: '@DEBUG@',
            packages: {},
            fns: {}
        },

        /**
         * The version of the library.
         * NOTICE: '@VERSION@' will replace with current version when compressing.
         * @type {String}
         */
        version: '@VERSION@',

        /**
         * set modulex configuration
         * @param {Object|String} configName Config object or config key.
         * @param {String} configName.base modulex 's base path. Default: get from loader(-min).js or seed(-min).js
         * @param {String} configName.tag modulex 's timestamp for native module. Default: modulex 's build time.
         * @param {Boolean} configName.debug whether to enable debug mod.
         * @param {Boolean} configName.combine whether to enable combo.
         * @param {Object} configName.packages Packages definition with package name as the key.
         * @param {String} configName.packages.base Package base path.
         * @param {String} configName.packages.tag  Timestamp for this package's module file.
         * @param {String} configName.packages.debug Whether force debug mode for current package.
         * @param {String} configName.packages.combine Whether allow combine for current package modules.
         * can only be used in production mode.
         * @param [configValue] config value.
         *
         * for example:
         *     @example
         *     modulex.config({
         *      combine: true,
         *      base: '.',
         *      packages: {
         *          'gallery': {
         *              base: 'http://a.tbcdn.cn/s/modulex/gallery/'
         *          }
         *      },
         *      modules: {
         *          'gallery/x/y': {
         *              requires: ['gallery/x/z']
         *          }
         *      }
         *     });
         */
        config: function (configName, configValue) {
            var cfg, r, fn;
            var Config = mx.Config;
            var configFns = Config.fns;
            var self = this;
            if (typeof configName === 'string') {
                cfg = configFns[configName];
                if (configValue === undefined) {
                    if (cfg) {
                        r = cfg.call(self);
                    } else {
                        r = Config[configName];
                    }
                } else {
                    if (cfg) {
                        r = cfg.call(self, configValue);
                    } else {
                        Config[configName] = configValue;
                    }
                }
            } else {
                for (var p in configName) {
                    configValue = configName[p];
                    fn = configFns[p];
                    if (fn) {
                        fn.call(self, configValue);
                    } else {
                        Config[p] = configValue;
                    }
                }
            }
            return r;
        }
    };

    var Loader = mx.Loader = {};

    /**
     * Loader Status Enum
     * @enum {Number} modulex.Loader.Status
     */
    Loader.Status = {
        /** error */
        ERROR: -1,
        /** unloaded */
        UNLOADED: 0,
        /** loading */
        LOADING: 1,
        /** loaded */
        LOADED: 2,
        /** initializing */
        INITIALIZING: 3,
        /** initialized */
        INITIALIZED: 4
    };

    return mx;
})();