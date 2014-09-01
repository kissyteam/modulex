modulex.clearLoader = function () {
    var self = this;
    var Env = self.Env;
    var modules = Env.mods;
    var m;
    self.config({
        alias: false,
        tag: false,
        group: false,
        packages: false
    });
    for (m in modules) {
        delete modules[m];
    }
};