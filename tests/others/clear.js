modulex.clearLoader = function () {
    var self = this;
    var Env = self.Env;
    var modules = Env.mods;
    var m;
    self.config({
        alias: false,
        tag: false,
        debug: true,
        group: false,
        packages: false
    });
    for (m in modules) {
        if (m !== 'logger') {
            delete modules[m];
        }
    }
};