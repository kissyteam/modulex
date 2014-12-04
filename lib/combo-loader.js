/**
 * combo loader. using combo to load module files.
 * @ignore
 * @author yiminghe@gmail.com
 */
(function (mx, undefined) {
  var Loader = mx.Loader;
  var Config = mx.Config;
  var Status = Loader.Status;
  var Utils = Loader.Utils;
  var addModule = Utils.addModule;
  var each = Utils.each;
  var getHash = Utils.getHash;
  var LOADING = Status.LOADING;
  var LOADED = Status.LOADED;
  var ERROR = Status.ERROR;
  var oldIE = Utils.ieMode && Utils.ieMode < 10;

  function loadScripts(rss, callback, timeout) {
    var count = rss && rss.length;
    var errorList = [];
    var successList = [];

    function complete() {
      if (!(--count)) {
        callback(successList, errorList);
      }
    }

    each(rss, function (rs) {
      var mod;
      var config = {
        timeout: timeout,
        success: function () {
          successList.push(rs);
          if (mod && currentMod) {
            // standard browser(except ie9) fire load after modulex.add immediately
            addModule(mod.id, currentMod.factory, currentMod.config);
            currentMod = undefined;
          }
          complete();
        },
        error: function () {
          errorList.push(rs);
          complete();
        },
        charset: rs.charset
      };
      if (!rs.combine) {
        mod = rs.mods[0];
        if (mod.getType() === 'css') {
          mod = undefined;
        } else if (oldIE) {
          startLoadModId = mod.id;
          if ('@DEBUG@') {
            startLoadModTime = +new Date();
          }
          config.attrs = {
            'data-mod-id': mod.id
          };
        }
      }
      Config.loadModsFn(rs, config);
    });
  }

  var loaderId = 0;

  /**
   * @class modulex.Loader.ComboLoader
   * using combo to load module files
   * @param callback
   * @private
   */
  function ComboLoader(callback) {
    this.callback = callback;
    this.head = this.tail = undefined;
    this.id = 'loader' + (++loaderId);
  }

  var currentMod;
  var startLoadModId;
  var startLoadModTime;

  function checkRequire(config, factory) {
    // use require primitive statement
    // function(mx, require){ require('node') }
    if (!config && typeof factory === 'function') {
      var requires = Utils.getRequiresFromFn(factory);
      if (requires.length) {
        config = config || {};
        config.requires = requires;
      }
    } else {
      // modulex.add(function(){},{requires:[]})
      if (config && config.requires && !config.cjs) {
        config.cjs = 0;
      }
    }
    return config;
  }

  function adaptRequirejs(requires) {
    var ret = [];
    var i, r, len;
    for (i = 0, len = requires.length; i < len; i++) {
      r = requires[i];
      if (r === 'exports' || r === 'module' || r === 'require') {

      } else {
        ret.push(r);
      }
    }
    return ret;
  }

  ComboLoader.add = function (id, factory, config, argsLen) {
    // modulex.add('xx',[],function(){});
    if (argsLen === 3 && Utils.isArray(factory)) {
      var tmp = factory;
      factory = config;
      config = {
        requires: adaptRequirejs(tmp),
        cjs: 1
      };
    }
    // modulex.add(function(){}), modulex.add('a'), modulex.add(function(){},{requires:[]})
    if (typeof id === 'function' || argsLen === 1) {
      config = factory;
      factory = id;
      config = checkRequire(config, factory);
      if (oldIE) {
        // http://groups.google.com/group/commonjs/browse_thread/thread/5a3358ece35e688e/43145ceccfb1dc02#43145ceccfb1dc02
        id = findModuleIdByInteractive();
        addModule(id, factory, config);
        startLoadModId = null;
        startLoadModTime = 0;
      } else {
        // standard browser associates id with definition when onload
        currentMod = {
          factory: factory,
          config: config
        };
      }
    } else {
      // modulex.add('x',function(){},{requires:[]})
      if (oldIE) {
        startLoadModId = null;
        startLoadModTime = 0;
      } else {
        currentMod = undefined;
      }
      config = checkRequire(config, factory);
      addModule(id, factory, config);
    }
  };

  function findModuleIdByInteractive() {
    var scripts = document.getElementsByTagName('script');
    var re, i, id, script;

    for (i = scripts.length - 1; i >= 0; i--) {
      script = scripts[i];
      if (script.readyState === 'interactive') {
        re = script;
        break;
      }
    }

    if (re) {
      id = re.getAttribute('data-mod-id');
    } else {
      // sometimes when read module file from cache,
      // interactive status is not triggered
      // module code is executed right after inserting into dom
      // i has to preserve module name before insert module script into dom,
      // then get it back here
      id = startLoadModId;
    }
    return id;
  }

  var debugRemoteModules;

  if ('@DEBUG@') {
    debugRemoteModules = function (rss) {
      each(rss, function (rs) {
        var ms = [];
        each(rs.mods, function (m) {
          if (m.status === LOADED) {
            ms.push(m.id);
          }
        });
      });
    };
  }

  function getCommonPathPrefix(str1, str2) {
    // ie bug
    // 'a//b'.split(/\//) => [a,b]
    var protocolIndex = str1.indexOf('//');
    var prefix = '';
    if (protocolIndex !== -1) {
      prefix = str1.substring(0, str1.indexOf('//') + 2);
    }
    str1 = str1.substring(prefix.length).split(/\//);
    str2 = str2.substring(prefix.length).split(/\//);
    var l = Math.min(str1.length, str2.length);
    for (var i = 0; i < l; i++) {
      if (str1[i] !== str2[i]) {
        break;
      }
    }
    return prefix + str1.slice(0, i).join('/') + '/';
  }

  // ??editor/plugin/x,editor/plugin/b
  // =>
  // editor/plugin/??x,b
  function getUriConsiderCommonPrefix(commonPrefix, currentComboUris, basePrefix, comboPrefix, comboSep, suffix) {
    if (commonPrefix && currentComboUris.length > 1) {
      var commonPrefixLen = commonPrefix.length;
      var currentUris = [];
      for (var i = 0; i < currentComboUris.length; i++) {
        currentUris[i] = currentComboUris[i].substring(commonPrefixLen);
      }
      return basePrefix + commonPrefix + comboPrefix + currentUris.join(comboSep) + suffix;
    } else {
      return basePrefix + comboPrefix + currentComboUris.join(comboSep) + suffix;
    }
  }

  Utils.mix(ComboLoader.prototype, {
    /**
     * load modules asynchronously
     */
    use: function (allMods) {
      var self = this;
      var comboUris;
      var timeout = Config.timeout;

      comboUris = self.getComboUris(allMods);

      // load css first to avoid page blink
      if (comboUris.css) {
        loadScripts(comboUris.css, function (success, error) {
          if ('@DEBUG@') {
            debugRemoteModules(success);
          }

          each(success, function (one) {
            each(one.mods, function (mod) {
              addModule(mod.id, Utils.noop);
              // notify all loader instance
              mod.flush();
            });
          });

          each(error, function (one) {
            each(one.mods, function (mod) {
              var msg = mod.id + ' is not loaded! can not find module in uri: ' + one.uri;
              console.error(msg);
              mod.status = ERROR;
              var error = {
                type: 'load',
                exception: msg,
                module: mod
              };
              mod.error = error;
              if (mod.onError) {
                mod.onError(error);
              }
              if (Config.onModuleError) {
                Config.onModuleError(error);
              }
              // notify all loader instance
              mod.flush();
            });
          });
        }, timeout);
      }

      // jss css download in parallel
      if (comboUris.js) {
        loadScripts(comboUris.js, function (success) {
          if ('@DEBUG@') {
            debugRemoteModules(success);
          }

          each(comboUris.js, function (one) {
            each(one.mods, function (mod) {
              // fix #111
              // https://github.com/kissyteam/modulex/issues/111
              if (!mod.factory) {
                var msg = mod.id +
                  ' is not loaded! can not find module in uri: ' +
                  one.uri;
                console.error(msg);
                mod.status = ERROR;
                var error = {
                  type: 'load',
                  exception: msg,
                  module: mod
                };
                mod.error = error;
                if (mod.onError) {
                  mod.onError(error);
                }
                if (Config.onModuleError) {
                  Config.onModuleError(error);
                }
              }
              // notify all loader instance
              mod.flush();
            });
          });
        }, timeout);
      }
    },

    /**
     * calculate dependency
     */
    calculate: function (unloadedMods, errorList, stack, cache, ret) {
      var i, m, mod,
        modStatus, stackDepth;
      var self = this;

      if ('@DEBUG@') {
        stack = stack || [];
      }
      ret = ret || [];
      // 提高性能，不用每个模块都再次全部依赖计算
      // 做个缓存，每个模块对应的待动态加载模块
      cache = cache || {};

      for (i = 0; i < unloadedMods.length; i++) {
        mod = unloadedMods[i];
        m = mod.id;

        if (cache[m]) {
          continue;
        }

        if ('@DEBUG@') {
          stackDepth = stack.length;
        }

        modStatus = mod.status;
        if (modStatus === ERROR) {
          errorList.push(mod);
          cache[m] = 1;
          continue;
        }
        if (modStatus > LOADED) {
          cache[m] = 1;
          continue;
        } else if (modStatus !== LOADED && !mod.contains(self)) {
          if (modStatus !== LOADING) {
            mod.status = LOADING;
            ret.push(mod);
          }
          mod.add(self);
          self.wait(mod);
        }

        if ('@DEBUG@') {
          // do not use indexOf, poor performance in ie8
          if (stack[m]) {
            console.warn('find cyclic dependency between mods: ' + stack);
            cache[m] = 1;
            continue;
          } else {
            stack[m] = 1;
            stack.push(m);
          }
        }

        self.calculate(mod.getNormalizedRequiredModules(), errorList, stack, cache, ret);
        cache[m] = 1;
        if ('@DEBUG@') {
          for (var si = stackDepth; si < stack.length; si++) {
            stack[stack[si]] = 0;
          }
          stack.length = stackDepth;
        }
      }

      return ret;
    },

    /**
     * get combo mods for modNames
     */
    getComboMods: function (mods) {
      var i, tmpMods, mod, packageInfo, type,
        tag, charset, packageBase,
        packageName, group, modUri;
      var l = mods.length;
      var groups = {
        /*
         js: {
         'groupA-gbk':{
         'http://x.com':[m1,m2]
         }
         }
         */
      };
      var normals = {
        /*
         js:{
         'http://x.com':[m1,m2]
         }
         */
      };
      for (i = 0; i < l; ++i) {
        mod = mods[i];
        type = mod.getType();
        modUri = mod.getUri();
        packageInfo = mod.getPackage();

        if (packageInfo) {
          packageBase = packageInfo.getBase();
          packageName = packageInfo.name;
          charset = packageInfo.getCharset();
          tag = packageInfo.getTag();
          group = packageInfo.getGroup();
        } else {
          packageBase = mod.id;
        }

        // absolute url can not comboed
        if (packageInfo && packageInfo.isCombine() && group) {
          var typeGroups = groups[type] || (groups[type] = {});
          group = group + '-' + charset;
          var typeGroup = typeGroups[group] || (typeGroups[group] = {});
          var find = 0;
          /*jshint loopfunc:true*/
          Utils.each(typeGroup, function (tmpMods, prefix) {
            if (Utils.isSameOriginAs(prefix, packageBase)) {
              var newPrefix = getCommonPathPrefix(prefix, packageBase);
              tmpMods.push(mod);
              if (tag && tag !== tmpMods.tag) {
                tmpMods.tag = getHash(tmpMods.tag + tag);
              }
              delete typeGroup[prefix];
              typeGroup[newPrefix] = tmpMods;
              find = 1;
            }
          });
          if (!find) {
            tmpMods = typeGroup[packageBase] = [mod];
            tmpMods.charset = charset;
            tmpMods.tag = tag || '';
          }
        } else {
          var normalTypes = normals[type] || (normals[type] = {});
          if (!(tmpMods = normalTypes[packageBase])) {
            tmpMods = normalTypes[packageBase] = [];
            tmpMods.charset = charset;
            tmpMods.tag = tag || '';
          } else {
            if (tag && tag !== tmpMods.tag) {
              tmpMods.tag = getHash(tmpMods.tag + tag);
            }
          }
          tmpMods.push(mod);
        }
      }

      return {
        groups: groups,
        normals: normals
      };
    },

    /**
     * Get combo uris
     */
    getComboUris: function (mods) {
      var comboPrefix = Config.comboPrefix;
      var comboSep = Config.comboSep;
      var comboRes = {};
      var maxFileNum = Config.comboMaxFileNum;
      var maxUriLength = Config.comboMaxUriLength;
      var comboMods = this.getComboMods(mods);

      function processSamePrefixUriMods(type, basePrefix, sendMods) {
        var currentComboUris = [];
        var currentComboMods = [];
        var tag = sendMods.tag;
        var charset = sendMods.charset;
        var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : '');

        var baseLen = basePrefix.length;
        var commonPrefix;
        var res = [];

        /*jshint loopfunc:true*/
        function pushComboUri(sentUri) {
          //noinspection JSReferencingMutableVariableFromClosure
          res.push({
            combine: 1,
            uri: sentUri,
            charset: charset,
            mods: currentComboMods
          });
        }

        function getSentUri() {
          return getUriConsiderCommonPrefix(commonPrefix, currentComboUris,
            basePrefix, comboPrefix, comboSep, suffix);
        }

        for (var i = 0; i < sendMods.length; i++) {
          var currentMod = sendMods[i];
          var uri = currentMod.getUri();
          if (!currentMod.getPackage() || !currentMod.getPackage().isCombine() ||
              // use(x/y) packageName: x/y ...
            !Utils.startsWith(uri, basePrefix)) {
            res.push({
              combine: 0,
              uri: uri,
              charset: charset,
              mods: [currentMod]
            });
            continue;
          }

          // ignore query parameter
          var subPath = uri.slice(baseLen).replace(/\?.*$/, '');
          currentComboUris.push(subPath);
          currentComboMods.push(currentMod);

          if (commonPrefix === undefined) {
            commonPrefix = subPath.indexOf('/') !== -1 ? subPath : '';
          } else if (commonPrefix !== '') {
            commonPrefix = getCommonPathPrefix(commonPrefix, subPath);
            if (commonPrefix === '/') {
              commonPrefix = '';
            }
          }

          if (currentComboUris.length > maxFileNum || getSentUri().length > maxUriLength) {
            currentComboUris.pop();
            currentComboMods.pop();
            pushComboUri(getSentUri());
            currentComboUris = [];
            currentComboMods = [];
            commonPrefix = undefined;
            i--;
          }
        }
        if (currentComboUris.length) {
          pushComboUri(getSentUri());
        }

        comboRes[type].push.apply(comboRes[type], res);
      }

      var type, prefix, group;
      var normals = comboMods.normals;
      var groups = comboMods.groups;

      // generate combo uris
      for (type in normals) {
        comboRes[type] = comboRes[type] || [];
        for (prefix in normals[type]) {
          processSamePrefixUriMods(type, prefix, normals[type][prefix]);
        }
      }

      for (type in groups) {
        comboRes[type] = comboRes[type] || [];
        for (group in groups[type]) {
          for (prefix in groups[type][group]) {
            processSamePrefixUriMods(type, prefix, groups[type][group][prefix]);
          }
        }
      }

      return comboRes;
    },

    flush: function () {
      var self = this;
      if (!self.callback) {
        return;
      }
      var head = self.head;
      var callback = self.callback;
      while (head) {
        var node = head.node;
        var status = node.status;
        if (status >= LOADED || status === ERROR) {
          node.remove(self);
          head = self.head = head.next;
        } else {
          return;
        }
      }
      self.callback = null;
      callback();
    },

    isCompleteLoading: function () {
      return !this.head;
    },

    wait: function (mod) {
      var self = this;
      if (!self.head) {
        self.tail = self.head = {
          node: mod
        };
      } else {
        var newNode = {
          node: mod
        };
        self.tail.next = newNode;
        self.tail = newNode;
      }
    }
  });

  Loader.ComboLoader = ComboLoader;
})(modulex);
/*
 2014-03-24 yiminghe@gmail.com
 - refactor group combo logic

 2014-01-14 yiminghe@gmail.com
 - support System.ondemand from es6

 2013-09-11 yiminghe@gmail.com
 - unify simple loader and combo loader

 2013-07-25 阿古, yiminghe@gmail.com
 - support group combo for packages

 2013-06-04 yiminghe@gmail.com
 - refactor merge combo loader and simple loader
 - support error callback

 2012-02-20 yiminghe@gmail.com
 - three status
 UNLOADED
 LOADED: load into page
 INITIALIZED: factory executed
 */