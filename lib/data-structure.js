/**
 * @ignore
 * setup data structure for modulex loader
 * @author yiminghe@gmail.com
 */
(function (mx, undefined) {
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

  function checkGlobalIfNotExist(self, property) {
    return self[property] !== undefined ? self[property] : Config[property];
  }

  /**
   * @class modulex.Loader.Package
   * @private
   */
  function Package(cfg) {
    var self = this;
    /**
     * name of package
     */
    self.name = undefined;
    /**
     * package base of package
     */
    self.base = undefined;
    /**
     * package entry module
     */
    self.main = undefined;
    /**
     * filter for package's modules
     */
    self.filter = undefined;
    /**
     * tag for package's modules
     */
    self.tag = undefined;
    /**
     * charset for package's modules
     */
    self.charset = undefined;
    /**
     * whether combine package's modules
     */
    self.combine = undefined;
    /**
     * combine modules in packages within the same group if combine is true
     */
    self.group = undefined;
    mix(self, cfg);
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
     * get package uri
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

  function async(self, mods, callback) {
    for (var i = 0; i < mods.length; i++) {
      mods[i] = self.resolve(mods[i]).id;
    }
    mx.use(mods, callback);
  }

  /**
   * @class modulex.Loader.Module
   */
  function Module(cfg) {
    var self = this;
    /**
     * exports of this module
     */
    self.exports = undefined;

    // es6 compatible
    self.module = self;

    /**
     * status of current modules
     */
    self.status = Status.UNLOADED;

    /**
     * name of this module
     */
    self.id = undefined;

    /**
     * factory of this module
     */
    self.factory = undefined;

    /**
     * user config
     *
     *  modulex.config('modules',{
         *      x: {
         *          y:1
         *      }
         *  })
     *
     *  x.js:
     *
     *  modulex.add(function(require, exports, module){
         *      console.log(module.config().y);
         *  });
     */
    self.config = undefined;

    // lazy initialize and commonjs module format
    self.cjs = 1;

    mix(self, cfg);

    self.waits = {};

    var require = self._require = function (id, callback) {
      if (typeof id === 'string') {
        var requiresModule = self.resolve(id);
        Utils.initModules(requiresModule.getNormalizedModules());
        return requiresModule.getExports();
      } else {
        async(self, id, callback);
      }
    };

    require.toUrl = function (relativeUrl) {
      var url = self.getUri();
      var prefix = '';
      var suffix = url;
      var index = url.indexOf('//');
      if (index !== -1) {
        prefix = url.slice(0, index + 2);
        suffix = url.slice(index + 2);
      }
      return prefix + Utils.normalizePath(suffix, relativeUrl);
    };

    require.load = mx.getScript;
  }

  Module.prototype = {
    modulex: 1,

    constructor: Module,

    config: function () {
      return this.config;
    },

    reset: function (cfg) {
      var self = this;
      mix(self, cfg);
      // module definition changes requires
      if (cfg.requires) {
        self.setRequiresModules(cfg.requires);
      }
    },

    require: function (id) {
      return this.resolve(id).getExports();
    },

    resolve: function (relativeId) {
      return createModule(Utils.normalizePath(this.id, relativeId));
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
        var id = self.id;
        if (Utils.endsWith(id, '.css')) {
          v = 'css';
        } else {
          v = 'js';
        }
        self.type = v;
      }
      return v;
    },

    getAlias: function () {
      var self = this;
      var id = self.id;
      if (self.normalizedAlias) {
        return self.normalizedAlias;
      }
      var alias = getShallowAlias(self);
      var ret = [];
      // implies no alias or else circular alias ...
      if (alias[0] === id) {
        ret = alias;
      } else {
        for (var i = 0, l = alias.length; i < l; i++) {
          var aliasItem = alias[i];
          if (aliasItem && aliasItem !== id) {
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
     * Get the path uri of current module if load dynamically
     * @return {String}
     */
    getUri: function () {
      var self = this;
      // es6: this.module.url
      if (!self.uri) {
        self.uri = Utils.normalizeSlash(mx.Config.resolveModFn(self));
      }
      return self.uri;
    },

    getUrl: function () {
      return this.getUri();
    },

    getExports: function () {
      var normalizedModules = this.getNormalizedModules();
      return normalizedModules[0] && normalizedModules[0].exports;
    },

    /**
     * Get the package which current module belongs to.
     * @return {modulex.Loader.Package}
     */
    getPackage: function () {
      var self = this;
      if (self.packageInfo === undefined) {
        var id = self.id;
        // absolute path does not belong to any package
        var packages = Config.packages;
        var modIdSlash = self.id + '/';
        var pName = '';
        var p;
        for (p in packages) {
          var pWithSlash = p;
          if (!Utils.endsWith(pWithSlash, '/')) {
            pWithSlash += '/';
          }
          if (startsWith(modIdSlash, pWithSlash) && p.length > pName.length) {
            pName = p;
          }
        }
        if (!packages[pName]) {
          if (startsWith(id, '/') ||
            startsWith(id, 'http://') ||
            startsWith(id, 'https://') ||
            startsWith(id, 'file://')) {
            self.packageInfo = null;
            return self.packageInfo;
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
            if (self.onError || Config.onModuleError) {
              var error = {
                type: 'init',
                exception: e,
                module: self
              };
              self.error = error;
              if (self.onError) {
                self.onError(error);
              }
              if (Config.onModuleError) {
                Config.onModuleError(error);
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
      if (Config.afterModuleInit) {
        Config.afterModuleInit(self);
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
      this.error = null;
      this.factory = null;
      this.exports = null;
    }
  };

  function pluginAlias(id) {
    var index = id.indexOf('!');
    if (index !== -1) {
      var pluginId = id.substring(0, index);
      id = id.substring(index + 1);
      var pluginMod = createModule(pluginId);
      pluginMod.initRecursive();
      var Plugin = pluginMod.getExports() || {};
      if (Plugin.alias) {
        id = Plugin.alias(mx, id, pluginId);
      }
    }
    return id;
  }

  function normalizeRequires(requires, self) {
    requires = requires || [];
    var l = requires.length;
    for (var i = 0; i < l; i++) {
      requires[i] = self.resolve(requires[i]).id;
    }
    return requires;
  }

  function getShallowAlias(mod) {
    var id = mod.id;
    var packageInfo;
    var alias = mod.alias;
    if (typeof alias === 'string') {
      mod.alias = alias = [alias];
    }
    if (alias) {
      return alias;
    }
    packageInfo = mod.getPackage();

    if (packageInfo) {
      var main;
      // support main in package config
      if (packageInfo.name === id && (main = packageInfo.main)) {
        id += '/';
        if (main.charAt(0) !== '.') {
          main = './' + main;
        }
        alias = [Utils.normalizePath(id, main)];
      } else if (packageInfo.alias) {
        alias = packageInfo.alias(id);
      }
    }
    alias = mod.alias = alias || [
      pluginAlias(id)
    ];
    return alias;
  }

  Loader.Module = Module;
})(modulex);
/**
 * refer:
 * - es6 module: http://www.2ality.com/2014/09/es6-modules-final.html
 */
