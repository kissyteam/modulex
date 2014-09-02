/**
 * use document.write to load external css files in block loading ways.
 * depends on loader.
 * @ignore
 * @author yiminghe@gmail.com
 */
(function (mx) {
    var method = 'writeln';

    function importStyle(modNames, __test) {
        if (typeof modNames === 'string') {
            modNames = modNames.split(',');
        }
        var Utils = mx.Loader.Utils;
        var Status = mx.Loader.Status;
        var each = Utils.each;
        var ComboLoader = mx.Loader.ComboLoader;
        var loader = new ComboLoader();
        var mods = Utils.createModules(modNames);
        var unloadedMods = [];
        each(mods, function (mod) {
            unloadedMods.push.apply(unloadedMods, mod.getNormalizedModules());
        });
        unloadedMods = loader.calculate(unloadedMods, []);
        var unloadedCssMods = [];
        each(unloadedMods, function (mod) {
            if (mod.getType() === 'css') {
                mod.status = Status.INITIALIZED;
                unloadedCssMods.push(mod);
            } else {
                mod.status = Status.UNLOADED;
            }
        });
        var comboUrls = loader.getComboUrls(unloadedCssMods);
        if (__test) {
            return comboUrls;
        }
        // load css first to avoid page blink
        if (comboUrls.css) {
            each(comboUrls.css, function (rs) {
                document[method](' <link rel="stylesheet" href="' + rs.url + '">');
            });
        }
    }

    mx.importStyle = importStyle;
})(modulex);
