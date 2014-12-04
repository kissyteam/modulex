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
  mx.getScript = function (uri, success, charset) {
    var error;
    if (typeof success === 'object') {
      charset = success.charset;
      error = success.error;
      success = success.success;
    }
    if (Utils.endsWith(uri, '.css')) {
      console.warn('node js can not load css: ' + uri);
      if (success) {
        success();
      }
      return;
    }
    if (!fs.existsSync(uri)) {
      var e = 'can not find file ' + uri;
      console.error(e);
      if (error) {
        error(e);
      }
      return;
    }
    try {
      // async is controlled by async option in use
      // sync load in getScript, same as cached load in browser environment
      var mod = fs.readFileSync(uri, charset);
      // code in runInThisContext unlike eval can not access local scope
      // noinspection JSUnresolvedFunction
      // use path, or else use uri will error in nodejs debug mode
      var define = useDefine ? ', define' : '';
      var factory = vm.runInThisContext('(function(modulex' + define + '){' + mod + '})', uri);
      factory(mx, mx.add);
      if (success) {
        success();
      }
    } catch (e) {
      console.error('in file: ' + uri);
      console.error(e.stack);
      if (error) {
        error(e);
      }
    }
  };

  module.exports = mx;

  mx.config({
    charset: 'utf-8'
  });

  // require synchronously in node js
  mx.nodeRequire = function (id) {
    var ret = [];
    mx.use([id], function () {
      ret = arguments;
    });
    return ret[0];
  };

  mx.config('packages', {
    core: {
      filter: '',
      base: __dirname
    }
  });

  var useDefine = 1;
  mx.noConflict = function () {
    useDefine = 0;
  };
})(modulex);