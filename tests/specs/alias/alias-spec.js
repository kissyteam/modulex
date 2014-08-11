var run = function (combine) {
    /*jshint quotmark:false*/
    describe("modulex Loader alias" + (combine ? 'at combo mode' : ''), function () {
        beforeEach(function () {
            modulex.config('combine', !!combine);
        });

        afterEach(function () {
            modulex.clearLoader();
        });

        it('works for package alias', function (done) {
            var modules = {
                'alias-a/x': ['alias-a/b', 'alias-a/c'],
                'alias-a/d': ['alias-a/d/e', 'alias-a/d/f']
            };
            modulex.config({
                packages: {
                    'alias-a': {
                        base: './specs/alias/alias-a',
                        alias: function (name) {
                            return modules[name];
                        }
                    }
                }
            });
            modulex.use(['alias-a/x'], function (X) {
                expect(X).to.be.equal('alias-a/b');
                done();
            });
        });

        it('works for global alias', function (done) {
            var modules = {
                'alias-a/x': ['alias-a/b', 'alias-a/c'],
                'alias-a/d': ['alias-a/d/e', 'alias-a/d/f']
            };
            modulex.config({
                alias: modules,
                packages: {
                    'alias-a': {
                        base: './specs/alias/alias-a'
                    }
                }
            });
            modulex.use(['alias-a/x'], function (X) {
                expect(X).to.be.equal('alias-a/b');
                done();
            });
        });

        it('alias works for module', function (done) {
            modulex.config({
                packages: {
                    'alias-a': {
                        base: './specs/alias/alias-a'
                    }
                },
                modules: {
                    'alias-a/x': {
                        alias: ['alias-a/b', 'alias-a/c']
                    },
                    'alias-a/d': {
                        alias: ['alias-a/d/e', 'alias-a/d/f']
                    },
                    'alias-a/b': {
                        requires: ['alias-a/d']
                    }
                }
            });

            modulex.use(['alias-a/x'], function (X) {
                expect(X).to.be.equal('alias-a/b');
                done();
            });
        });
    });
};
run();
run(1);