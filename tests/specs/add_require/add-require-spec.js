var run = function (combine) {
    /*jshint quotmark:false*/
    describe("modulex.config('modules', {x:{requires:[]}}) " + (combine ? 'at combo mode' : ''), function () {
        var mx = modulex;
        beforeEach(function () {
            modulex.config('combine', !!combine);
        });

        afterEach(function () {
            modulex.clearLoader();
        });
        it("should solve index", function () {
            modulex.config("modules", {
                "add_require/x/": {
                    requires: ['add_require/y/']
                }
            });

            expect(modulex.Env.mods["add_require/x/"]).to.be.equal(undefined);
            expect(modulex.Env.mods["add_require/x/index"]).to.not.be.equal(undefined);
            expect(modulex.Env.mods["add_require/y/"]).to.be.equal(undefined);
            expect(modulex.Env.mods["add_require/y/index"]).to.be.equal(undefined);
            expect(modulex.Env.mods["add_require/x/index"].requires).to.deep.equal(['add_require/y/']);

            modulex.config('modules', {
                "add_require/a/": {
                    requires: ['add_require/b/']
                }
            });

            expect(modulex.Env.mods["add_require/a/"]).to.be.equal(undefined);
            expect(modulex.Env.mods["add_require/a/index"]).to.not.be.equal(undefined);
            expect(modulex.Env.mods["add_require/b/"]).to.be.equal(undefined);
            expect(modulex.Env.mods["add_require/b/index"]).to.be.equal(undefined);
            expect(modulex.Env.mods["add_require/a/index"].requires)
                .to.deep.equal(['add_require/b/']);

            modulex.add('add_require/a/', '2', {
                requires: ['add_require/b/']
            });

            modulex.add('add_require/b/', '1');

            modulex.use(['add_require/a/']);

            expect(mx.require('add_require/b/')).to.be.equal('1');
            expect(mx.require('add_require/a/')).to.be.equal('2');
        });
    });
};
run();
run(1);