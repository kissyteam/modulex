/**
 * @ignore
 * setup data structure for modulex loader
 * @author yiminghe@gmail.com
 */
(function (mx) {
    var Loader = mx.Loader;
    var Config = mx.Config;
    var Status = Loader.Status;
    var INITIALIZED = Status.INITIALIZED;
    var INITIALIZING = Status.INITIALIZING;
    var ERROR = Status.ERROR;
    var Utils = Loader.Utils;
    var startsWith = Utils.startsWith;
    var createModule = Utils.createModule;
    var mix = Utils.mix;

    function makeArray(arr) {
        var ret = [];
        for (var i = 0; i < arr.length; i++) {
            ret[i] = arr[i];
        }
        return ret;
    }

    function checkGlobalIfNotExist(self, property) {
        return property in self ? self[property] : Config[property];
    }

    /**
     * @class modulex.Loader.Package
     * @private
     */
    function Package(cfg) {
        mix(this, cfg);
    }

    Package.prototype = {
        constructor: Package,

        reset: function (cfg) {
            mix(this, cfg);
        },

        getFilter: function () {
            return checkGlobalIfNotExist(this, 'filter');
        },

        /**
         * Tag for package.
         * tag can not contain ".", eg: Math.random() !
         * @return {String}
         */
        getTag: function () {
            return checkGlobalIfNotExist(this, 'tag');
        },

        /**
         * get package url
         */
        getBase: function () {
            return this.base;
        },

        /**
         * Get charset for package.
         * @return {String}
         */
        getCharset: function () {
            return checkGlobalIfNotExist(this, 'charset');
        },

        /**
         * Whether modules are combined for this package.
         * @return {Boolean}
         */
        isCombine: function () {
            return checkGlobalIfNotExist(this, 'combine');
        },

        /**
         * Get package group (for combo).
         * @returns {String}
         */
        getGroup: function () {
            return checkGlobalIfNotExist(this, 'group');
        }
    };

    Loader.Package = Package;

    /**
     * @class modulex.Loader.Module
     */
    function Module(cfg) {
        var self = this;
        /**
         * exports of this module
         */
        self.exports = undefined;

        /**
         * status of current modules
         */
        self.status = Status.UNLOADED;

        /**
         * name of this module
         */
        self.name = undefined;

        /**
         * factory of this module
         */
        self.factory = undefined;

        // lazy initialize and commonjs module format
        self.cjs = 1;

        mix(self, cfg);

        self.waits = {};

        var require = self._require = function (moduleName) {
            if (typeof moduleName === 'string') {
                var requiresModule = self.resolve(moduleName);
                Utils.initModules(requiresModule.getNormalizedModules());
                return requiresModule.getExports();
            } else {
                require.async.apply(require, arguments);
            }
        };

        require.async = function (mods) {
            for (var i = 0; i < mods.length; i++) {
                mods[i] = self.resolve(mods[i]).name;
            }
            var args = makeArray(arguments);
            args[0] = mods;
            mx.use.apply(mx, args);
        };

        require.resolve = function (relativeName) {
            return self.resolve(relativeName).getUrl();
        };

        require.toUrl = function (path) {
            var url = self.getUrl();
            var pathIndex = url.indexOf('//');
            if (pathIndex === -1) {
                pathIndex = 0;
            } else {
                pathIndex = url.indexOf('/', pathIndex + 2);
                if (pathIndex === -1) {
                    pathIndex = 0;
                }
            }
            var rest = url.substring(pathIndex);
            path = Utils.normalizePath(rest, path);
            return url.substring(0, pathIndex) + path;
        };

        require.load = mx.getScript;
    }

    Module.prototype = {
        modulex: 1,

        constructor: Module,

        config: function (cfg) {
            var self = this;
            mix(self, cfg);
            // module definition changes requires
            if (cfg.requires) {
                self.setRequiresModules(cfg.requires);
            }
        },

        require: function (moduleName) {
            return this.resolve(moduleName).getExports();
        },

        resolve: function (relativeName) {
            return createModule(Utils.normalizePath(this.name, relativeName));
        },

        add: function (loader) {
            this.waits[loader.id] = loader;
        },

        remove: function (loader) {
            delete this.waits[loader.id];
        },

        contains: function (loader) {
            return this.waits[loader.id];
        },

        flush: function () {
            Utils.each(this.waits, function (loader) {
                loader.flush();
            });
            this.waits = {};
        },

        /**
         * Get the type if current Module
         * @return {String} css or js
         */
        getType: function () {
            var self = this;
            var v = self.type;
            if (!v) {
                if (Utils.endsWith(self.name, '.css')) {
                    v = 'css';
                } else {
                    v = 'js';
                }
                self.type = v;
            }
            return v;
        },

        getExports: function () {
            return this.getNormalizedModules()[0].exports;
        },

        getAlias: function () {
            var self = this;
            var name = self.name;
            if (self.normalizedAlias) {
                return self.normalizedAlias;
            }
            var alias = getShallowAlias(self);
            var ret = [];
            if (alias[0] === name) {
                ret = alias;
            } else {
                for (var i = 0, l = alias.length; i < l; i++) {
                    var aliasItem = alias[i];
                    if (aliasItem && aliasItem !== name) {
                        var mod = createModule(aliasItem);
                        var normalAlias = mod.getAlias();
                        if (normalAlias) {
                            ret.push.apply(ret, normalAlias);
                        } else {
                            ret.push(aliasItem);
                        }
                    }
                }
            }
            self.normalizedAlias = ret;
            return ret;
        },

        getNormalizedModules: function () {
            var self = this;
            if (self.normalizedModules) {
                return self.normalizedModules;
            }
            self.normalizedModules = Utils.map(self.getAlias(), function (alias) {
                return createModule(alias);
            });
            return self.normalizedModules;
        },

        /**
         * Get the path url of current module if load dynamically
         * @return {String}
         */
        getUrl: function () {
            var self = this;
            if (!self.url) {
                self.url = Utils.normalizeSlash(mx.Config.resolveModFn(self));
            }
            return self.url;
        },

        /**
         * Get the package which current module belongs to.
         * @return {modulex.Loader.Package}
         */
        getPackage: function () {
            var self = this;
            if (!('packageInfo' in self)) {
                var name = self.name;
                // absolute path
                if (startsWith(name, '/') ||
                    startsWith(name, 'http://') ||
                    startsWith(name, 'https://') ||
                    startsWith(name, 'file://')) {
                    self.packageInfo = null;
                    return;
                }
                var packages = Config.packages;
                var modNameSlash = self.name + '/';
                var pName = '';
                var p;
                for (p in packages) {
                    if (startsWith(modNameSlash, p + '/') && p.length > pName.length) {
                        pName = p;
                    }
                }
                self.packageInfo = packages[pName] || packages.core;
            }
            return self.packageInfo;
        },

        /**
         * Get the tag of current module.
         * tag can not contain ".", eg: Math.random() !
         * @return {String}
         */
        getTag: function () {
            var self = this;
            return self.tag || self.getPackage() && self.getPackage().getTag();
        },

        /**
         * Get the charset of current module
         * @return {String}
         */
        getCharset: function () {
            var self = this;
            return self.charset || self.getPackage() && self.getPackage().getCharset();
        },

        setRequiresModules: function (requires) {
            var self = this;
            var requiredModules = self.requiredModules = Utils.map(normalizeRequires(requires, self), function (m) {
                return createModule(m);
            });
            var normalizedRequiredModules = [];
            Utils.each(requiredModules, function (mod) {
                normalizedRequiredModules.push.apply(normalizedRequiredModules, mod.getNormalizedModules());
            });
            self.normalizedRequiredModules = normalizedRequiredModules;
        },

        getNormalizedRequiredModules: function () {
            var self = this;
            if (self.normalizedRequiredModules) {
                return self.normalizedRequiredModules;
            }
            self.setRequiresModules(self.requires);
            return self.normalizedRequiredModules;
        },

        getRequiredModules: function () {
            var self = this;
            if (self.requiredModules) {
                return self.requiredModules;
            }
            self.setRequiresModules(self.requires);
            return self.requiredModules;
        },

        callFactory: function () {
            var self = this;
            return self.factory.apply(self,
                (
                    self.cjs ?
                        [self._require, self.exports, self] :
                        Utils.map(self.getRequiredModules(), function (m) {
                            return m.getExports();
                        })
                    )
            );
        },

        initSelf: function () {
            var self = this;
            var factory = self.factory;
            var exports;
            if (typeof factory === 'function') {
                self.exports = {};

                if (Config.debug) {
                    exports = self.callFactory();
                } else {
                    try {
                        exports = self.callFactory();
                    } catch (e) {
                        self.status = ERROR;
                        if (self.onInitError || Config.onModInitError) {
                            if (self.onInitError) {
                                self.onInitError(e, self);
                            }
                            if (Config.onModInitError) {
                                Config.onModInitError(e, self);
                            }
                        } else {
                            setTimeout(function () {
                                throw e;
                            }, 0);
                        }
                        return 0;
                    }
                    var success = 1;
                    Utils.each(self.getNormalizedRequiredModules(), function (m) {
                        if (m.status === ERROR) {
                            success = 0;
                            return false;
                        }
                    });
                    if (!success) {
                        return 0;
                    }
                }

                if (exports !== undefined) {
                    self.exports = exports;
                }
            } else {
                self.exports = factory;
            }
            self.status = INITIALIZED;
            if (self.afterInit) {
                self.afterInit(self);
            }
            if (Config.afterModInit) {
                Config.afterModInit(self);
            }
            return 1;
        },

        initRecursive: function () {
            var self = this;
            var success = 1;
            var status = self.status;
            if (status === ERROR) {
                return 0;
            }
            // initialized or circular dependency
            if (status >= INITIALIZING) {
                return success;
            }
            self.status = INITIALIZING;
            if (self.cjs) {
                // commonjs format will call require in module code again
                success = self.initSelf();
            } else {
                Utils.each(self.getNormalizedRequiredModules(), function (m) {
                    success = success && m.initRecursive();
                });
                if (success) {
                    self.initSelf();
                }
            }
            return success;
        },

        undef: function () {
            this.status = Status.UNLOADED;
            delete this.factory;
            delete this.exports;
        }
    };

    function pluginAlias(name) {
        var index = name.indexOf('!');
        if (index !== -1) {
            var pluginName = name.substring(0, index);
            name = name.substring(index + 1);
            var Plugin = createModule(pluginName).initRecursive().exports || {};
            if (Plugin.alias) {
                name = Plugin.alias(mx, name, pluginName);
            }
        }
        return name;
    }

    function normalizeRequires(requires, self) {
        requires = requires || [];
        var l = requires.length;
        for (var i = 0; i < l; i++) {
            requires[i] = self.resolve(requires[i]).name;
        }
        return requires;
    }

    function getShallowAlias(mod) {
        var name = mod.name;
        var packageInfo;
        var alias = mod.alias;
        if (typeof alias === 'string') {
            mod.alias = alias = [alias];
        }
        if (alias) {
            return alias;
        }
        packageInfo = mod.getPackage();
        if (packageInfo && packageInfo.alias) {
            alias = packageInfo.alias(name);
        }
        alias = mod.alias = alias || [
            pluginAlias(name)
        ];
        return alias;
    }

    Loader.Module = Module;
})(modulex);
