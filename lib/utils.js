/**
 * Utils for modulex loader
 * @author yiminghe@gmail.com
 */
(function (mx) {
    var Loader = mx.Loader;
    var Env = mx.Env;
    var Status = Loader.Status;
    var mods = Env.mods;
    var map = Array.prototype.map;
    var host = Env.host;
    /**
     * @class modulex.Loader.Utils
     * Utils for modulex Loader
     * @singleton
     * @private
     */
    var Utils = Loader.Utils = {};
    var doc = host.document;

    function numberify(s) {
        var c = 0;
        // convert '1.2.3.4' to 1.234
        return parseFloat(s.replace(/\./g, function () {
            return (c++ === 0) ? '.' : '';
        }));
    }

    function splitSlash(str) {
        var parts = str.split(/\//);
        if (str.charAt(0) === '/' && parts[0]) {
            parts.unshift('');
        }
        if (str.charAt(str.length - 1) === '/' && str.length > 1 && parts[parts.length - 1]) {
            parts.push('');
        }
        return parts;
    }

    var m, v;
    var ua = (host.navigator || {}).userAgent || '';

    // https://github.com/kissyteam/kissy/issues/545
    // AppleWebKit/535.19
    // AppleWebKit534.30
    // appleWebKit/534.30
    // ApplelWebkit/534.30 （SAMSUNG-GT-S6818）
    // AndroidWebkit/534.30
    if (((m = ua.match(/Web[Kk]it[\/]{0,1}([\d.]*)/)) || (m = ua.match(/Safari[\/]{0,1}([\d.]*)/))) && m[1]) {
        Utils.webkit = numberify(m[1]);
    }
    if ((m = ua.match(/Trident\/([\d.]*)/))) {
        Utils.trident = numberify(m[1]);
    }
    if ((m = ua.match(/Gecko/))) {
        Utils.gecko = 0.1; // Gecko detected, look for revision
        if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
            Utils.gecko = numberify(m[1]);
        }
    }
    if ((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) &&
        (v = (m[1] || m[2]))) {
        Utils.ie = numberify(v);
        Utils.ieMode = doc.documentMode || Utils.ie;
        Utils.trident = Utils.trident || 1;
    }

    var uriReg = /http(s)?:\/\/([^/]+)(?::(\d+))?/;
    var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
    var requireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;

    function normalizeId(id) {
        // 'x/' 'x/y/z/'
        if (id.charAt(id.length - 1) === '/') {
            id += 'index';
        }
        // x.js === x
        if (Utils.endsWith(id, '.js')) {
            id = id.slice(0, -3);
        }
        return id;
    }

    function each(obj, fn) {
        var i = 0;
        var myKeys, l;
        if (isArray(obj)) {
            l = obj.length;
            for (; i < l; i++) {
                if (fn(obj[i], i, obj) === false) {
                    break;
                }
            }
        } else {
            myKeys = keys(obj);
            l = myKeys.length;
            for (; i < l; i++) {
                if (fn(obj[myKeys[i]], myKeys[i], obj) === false) {
                    break;
                }
            }
        }
    }

    function keys(obj) {
        var ret = [];
        for (var key in obj) {
            ret.push(key);
        }
        return ret;
    }

    var isArray = Array.isArray || function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    function mix(to, from) {
        for (var i in from) {
            to[i] = from[i];
        }
        return to;
    }

    mix(Utils, {
        mix: mix,

        getSuffix: function (str) {
            var m = str.match(/\.(\w+)$/);
            if (m) {
                return m[1];
            }
        },

        noop: function () {
        },

        map: map ?
            function (arr, fn, context) {
                return map.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var len = arr.length;
                var res = new Array(len);
                for (var i = 0; i < len; i++) {
                    var el = typeof arr === 'string' ? arr.charAt(i) : arr[i];
                    if (el ||
                        //ie<9 in invalid when typeof arr == string
                        i in arr) {
                        res[i] = fn.call(context || this, el, i, arr);
                    }
                }
                return res;
            },

        startsWith: function (str, prefix) {
            return str.lastIndexOf(prefix, 0) === 0;
        },

        isEmptyObject: function (o) {
            for (var p in o) {
                if (p !== undefined) {
                    return false;
                }
            }
            return true;
        },

        endsWith: function (str, suffix) {
            var ind = str.length - suffix.length;
            return ind >= 0 && str.indexOf(suffix, ind) === ind;
        },

        now: Date.now || function () {
            return +new Date();
        },

        collectErrors: function (mods, errorList, cache) {
            var i, m, mod, modStatus;
            cache = cache || {};
            errorList = errorList || [];
            for (i = 0; i < mods.length; i++) {
                mod = mods[i];
                m = mod.id;
                if (cache[m]) {
                    continue;
                }
                cache[m] = 1;
                modStatus = mod.status;
                if (modStatus === Status.ERROR) {
                    errorList.push(mod);
                    continue;
                }
                Utils.collectErrors(mod.getNormalizedRequiredModules(), errorList, cache);
            }
            return errorList;
        },

        each: each,

        keys: keys,

        isArray: isArray,

        indexOf: function (item, arr) {
            for (var i = 0, l = arr.length; i < l; i++) {
                if (arr[i] === item) {
                    return i;
                }
            }
            return -1;
        },

        normalizeSlash: function (str) {
            return str.replace(/\\/g, '/');
        },

        normalizePath: function (parentPath, subPath) {
            var firstChar = subPath.charAt(0);
            if (firstChar !== '.') {
                return subPath;
            }
            var parts = splitSlash(parentPath);
            var subParts = splitSlash(subPath);
            parts.pop();
            for (var i = 0, l = subParts.length; i < l; i++) {
                var subPart = subParts[i];
                if (subPart === '.') {
                } else if (subPart === '..') {
                    parts.pop();
                } else {
                    parts.push(subPart);
                }
            }
            return parts.join('/').replace(/\/+/, '/');
        },

        isSameOriginAs: function (uri1, uri2) {
            var uriParts1 = uri1.match(uriReg);
            var uriParts2 = uri2.match(uriReg);
            return uriParts1[0] === uriParts2[0];
        },

        // get document head
        docHead: function () {
            return doc.getElementsByTagName('head')[0] || doc.documentElement;
        },

        // Returns hash code of a string djb2 algorithm
        getHash: function (str) {
            var hash = 5381;
            var i;
            for (i = str.length; --i > -1;) {
                hash = ((hash << 5) + hash) + str.charCodeAt(i);
                /* hash * 33 + char */
            }
            return hash + '';
        },

        getRequiresFromFn: function (fn) {
            var requires = [];
            // Remove comments from the callback string,
            // look for require calls, and pull them into the dependencies,
            // but only if there are function args.
            fn.toString()
                .replace(commentRegExp, '')
                .replace(requireRegExp, function (match, _, dep) {
                    requires.push(dep);
                });
            return requires;
        },

        // get a module from cache or create a module instance
        createModule: function (id, cfg) {
            var module = mods[id];
            if (!module) {
                id = normalizeId(id);
                module = mods[id];
            }
            if (module) {
                if (cfg) {
                    module.reset(cfg);
                }
                return module;
            }
            mods[id] = module = new Loader.Module(mix({
                id: id
            }, cfg));

            return module;
        },

        createModules: function (ids) {
            return Utils.map(ids, function (id) {
                return Utils.createModule(id);
            });
        },

        initModules: function (modsToInit) {
            var l = modsToInit.length;
            var i;
            var success = 1;
            for (i = 0; i < l; i++) {
                success &= modsToInit[i].initRecursive();
            }
            return success;
        },

        getModulesExports: function (mods) {
            var l = mods.length;
            var ret = [];
            for (var i = 0; i < l; i++) {
                ret.push(mods[i].getExports());
            }
            return ret;
        },

        addModule: function (id, factory, config) {
            var module = mods[id];
            if (module && module.factory !== undefined) {
                console.warn(id + ' is defined more than once');
                return;
            }
            Utils.createModule(id, mix({
                id: id,
                status: Loader.Status.LOADED,
                factory: factory
            }, config));
        }
    });
})(modulex);