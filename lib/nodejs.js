/**
 * @ignore
 * implement getScript for nodejs synchronously.
 * so loader need not to be changed.
 * @author yiminghe@gmail.com
 */
(function (mx) {
    /*global require*/
    var fs = require('fs');
    var Utils = mx.Loader.Utils;
    var vm = require('vm');
    mx.getScript = function (url, success, charset) {
        var error;
        if (typeof success === 'object') {
            charset = success.charset;
            error = success.error;
            success = success.success;
        }
        if (Utils.endsWith(url, '.css')) {
            mx.log('node js can not load css: ' + url, 'warn');
            if (success) {
                success();
            }
            return;
        }
        if (!fs.existsSync(url)) {
            var e = 'can not find file ' + url;
            mx.log(e, 'error');
            if (error) {
                error(e);
            }
            return;
        }
        try {
            // async is controlled by async option in use
            // sync load in getScript, same as cached load in browser environment
            var mod = fs.readFileSync(url, charset);
            // code in runInThisContext unlike eval can not access local scope
            // noinspection JSUnresolvedFunction
            // use path, or else use url will error in nodejs debug mode
            var factory = vm.runInThisContext('(function(modulex, requireNode){' + mod + '})', url);
            factory(mx, function (moduleName) {
                return require(Utils.normalizePath(url, moduleName));
            });
            if (success) {
                success();
            }
        } catch (e) {
            mx.log('in file: ' + url, 'error');
            mx.log(e.stack, 'error');
            if (error) {
                error(e);
            }
        }
    };
    mx.modulex = mx;
    /*global module*/
    if (typeof module !== 'undefined') {
        module.exports = mx;
    }
    mx.config({
        charset: 'utf-8',
        /*global __dirname*/
        base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'
    });
    // require synchronously in node js
    mx.nodeRequire = function (modName) {
        var ret = [];
        mx.use([modName], {
            success: function () {
                ret = [].slice.call(arguments, 1);
            },
            sync: true
        });
        return ret[0];
    };
    mx.config('packages', {
        core: {
            filter: ''
        }
    });
})(modulex);