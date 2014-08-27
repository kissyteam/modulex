/**
 * @ignore
 * init loader, set config
 * @author yiminghe@gmail.com
 */
(function (mx) {
    var doc = mx.Env.host && mx.Env.host.document;
    var defaultComboPrefix = '??';
    var defaultComboSep = ',';
    var Loader = mx.Loader;
    var Utils = Loader.Utils;
    var createModule = Utils.createModule;
    var ComboLoader = Loader.ComboLoader;
    var logger = mx.getLogger('modulex');

    Utils.mix(mx, {
        // internal usage
        getModule: function (modName) {
            return createModule(modName);
        },

        // internal usage
        getPackage: function (packageName) {
            return mx.Config.packages[packageName];
        },

        /**
         * Registers a module with the modulex global.
         * @param {String} name module name.
         * it must be set if combine is true in {@link modulex#config}
         * @param {Function} factory module definition function that is used to return
         * exports of this module
         * @param {modulex} factory.mx modulex global instance
         * @param {Object} [cfg] module optional config data
         * @param {String[]} cfg.requires this module's required module name list
         * @member modulex
         *
         *
         *      // dom module's definition
         *      modulex.add('dom', function(mx, xx){
         *          return {css: function(el, name, val){}};
         *      },{
         *          requires:['xx']
         *      });
         */
        add: function (name, factory, cfg) {
            ComboLoader.add(name, factory, cfg, arguments.length);
        },

        /**
         * Attached one or more modules to global modulex instance.
         * @param {String|String[]} modNames moduleNames. 1-n modules to bind(use comma to separate)
         * @param {Function} success callback function executed
         * when modulex has the required functionality.
         * @param {modulex} success.mx modulex instance
         * @param success.x... modules exports
         * @member modulex
         *
         *
         *      // loads and attached overlay,dd and its dependencies
         *      modulex.use(['overlay','dd'], function(mx, Overlay){});
         */
        use: function (modNames, success) {
            var loader, error;
            var tryCount = 0;
            if (typeof modNames === 'string') {
                modNames = modNames.split(/\s*,\s*/);
            }
            if (typeof success === 'object') {
                //noinspection JSUnresolvedVariable
                error = success.error;
                //noinspection JSUnresolvedVariable
                success = success.success;
            }
            var mods = Utils.createModules(modNames);
            var unloadedMods = [];
            Utils.each(mods, function (mod) {
                unloadedMods.push.apply(unloadedMods, mod.getNormalizedModules());
            });
            var normalizedMods = unloadedMods;

            function loadReady() {
                ++tryCount;
                var errorList = [];
                var start;
                if ('@DEBUG@') {
                    start = +new Date();
                }
                unloadedMods = loader.calculate(unloadedMods, errorList);
                var unloadModsLen = unloadedMods.length;
                logger.debug(tryCount + ' check duration ' + (+new Date() - start));
                if (errorList.length) {
                    mx.log('loader: load the following modules error', 'error');
                    mx.log(Utils.map(errorList, function (e) {
                        return e.name;
                    }), 'error');
                    if (error) {
                        if ('@DEBUG@') {
                            error.apply(mx, errorList);
                        } else {
                            try {
                                error.apply(mx, errorList);
                            } catch (e) {
                                /*jshint loopfunc:true*/
                                setTimeout(function () {
                                    throw e;
                                }, 0);
                            }
                        }
                    }
                } else if (loader.isCompleteLoading()) {
                    Utils.attachModules(normalizedMods);
                    if (success) {
                        if ('@DEBUG@') {
                            success.apply(mx, Utils.getModulesExports(mods));
                        } else {
                            try {
                                success.apply(mx, Utils.getModulesExports(mods));
                            } catch (e) {
                                /*jshint loopfunc:true*/
                                setTimeout(function () {
                                    throw e;
                                }, 0);
                            }
                        }
                    }
                } else {
                    // in case all of its required mods is loading by other loaders
                    loader.callback = loadReady;
                    if (unloadModsLen) {
                        logger.debug(tryCount + ' reload ');
                        loader.use(unloadedMods);
                    }
                }
            }

            loader = new ComboLoader(loadReady);
            // in case modules is loaded statically
            // synchronous check
            // but always async for loader
            loadReady();
            return mx;
        },

        /**
         * get module exports from modulex module cache
         * @param {String} moduleName module name
         * @member modulex
         * @return {*} exports of specified module
         */
        require: function (moduleName) {
            var requiresModule = createModule(moduleName);
            return requiresModule.getExports();
        },

        /**
         * undefine a module
         * @param {String} moduleName module name
         * @member modulex
         */
        undef: function (moduleName) {
            var requiresModule = createModule(moduleName);
            var mods = requiresModule.getNormalizedModules();
            Utils.each(mods, function (m) {
                m.undef();
            });
        }
    });

    mx.config({
        comboPrefix: defaultComboPrefix,
        comboSep: defaultComboSep,
        charset: 'utf-8',
        filter: '',
        lang: 'zh-cn'
    });
    mx.config('packages', {
        core: {
            filter: mx.Config.debug ? 'debug' : '',
            base: '.'
        }
    });
    // ejecta
    if (doc && doc.getElementsByTagName) {
        // will transform base to absolute path
        mx.config(Utils.mix({
            // 2k(2048) url length
            comboMaxUrlLength: 2000,
            // file limit number for a single combo url
            comboMaxFileNum: 40
        }));
    }
    mx.add('logger-manager', function () {
        return mx.LoggerMangaer;
    });
})(modulex);