var run = function (combine) {
    /*jshint quotmark:false*/
    describe("modulex.config('modules', {x:{requires:[]}}) " + (combine ? 'at combo mode' : ''), function () {
        var mx = modulex;
        beforeEach(function () {
            modulex.clearLoader();
            modulex.config('combine', !!combine);
        });
        it("should solve index", function () {
            modulex.config("modules", {
                "add_require/x/": {
                    requires: ['add_require/y/']
                }
            });

            modulex.config('modules', {
                "add_require/a/": {
                    requires: ['add_require/b/']
                }
            });

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