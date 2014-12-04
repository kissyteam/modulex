/**
 * @ignore
 * i18n plugin for modulex loader
 * @author yiminghe@gmail.com
 */
modulex.add('i18n', {
  alias: function (mx, id) {
    return id + '/i18n/' + mx.Config.lang;
  }
});