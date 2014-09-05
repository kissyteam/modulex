modulex.clearLoader = function () {
    var self = this;
    var mods = self.Env.mods;
    var keys = [];
    for (var m in mods) {
        if (m !== 'i18n') {
            keys.push(m);
        }
    }
    for (var i = 0, l = keys.length; i < l; i++) {
        delete mods[keys[i]];
    }
    self.config({
        onModuleError: 0,
        afterModuleInit: 0,
        // global config
        tag: 0,
        group: 0,
        packages: 0
    });
};