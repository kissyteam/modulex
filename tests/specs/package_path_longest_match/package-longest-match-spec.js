/*jshint quotmark:false*/

describe('loader package', function () {
    var mx = modulex;
    var Loader = mx.Loader;

    beforeEach(function () {
        modulex.config('combine', false);
    });

    afterEach(function () {
        modulex.clearLoader();
    });

    it('longest match works', function (done) {
        var debug = mx.Config.debug;
        mx.Config.debug = true;
        mx.config({
            packages: {
                test: {
                    base: './specs/package_path_longest_match/test'
                },
                test2: {
                    base: './specs/package_path_longest_match/test/test2'
                }
            }
        });

        var ret = 0;

        mx.use(['test2/a'], function (A) {
            ret = A;
            expect(A).to.be.equal(9);
            mx.Config.debug = debug;
            done();
        });
    });

    it('match by slash', function () {
        mx.config({
            packages: {
                com: {
                    base: './specs/package_path_longest_match/com'
                },
                'com/c': {
                    base: './specs/package_path_longest_match/com/c'
                }
            }
        });

        var m1 = new Loader.Module({
            name: 'component',
            runtime: mx
        });

        expect(m1.getPackage().name).to.be.equal('core');


        m1 = new Loader.Module({
            name: 'component/a',
            runtime: mx
        });

        expect(m1.getPackage().name).to.be.equal('core');

        m1 = new Loader.Module({
            name: 'component/a/c',
            runtime: mx
        });

        expect(m1.getPackage().name).to.be.equal('core');

        m1 = new Loader.Module({
            name: 'com',
            runtime: mx
        });

        expect(m1.getPackage().name).to.be.equal('com');

        m1 = new Loader.Module({
            name: 'com/a',
            runtime: mx
        });

        expect(m1.getPackage().name).to.be.equal('com');

        m1 = new Loader.Module({
            name: 'com/a/a',
            runtime: mx
        });

        expect(m1.getPackage().name).to.be.equal('com');

        m1 = new Loader.Module({
            name: 'com/c',
            runtime: mx
        });

        expect(m1.getPackage().name).to.be.equal('com/c');

        m1 = new Loader.Module({
            name: 'com/c/a',
            runtime: mx
        });

        expect(m1.getPackage().name).to.be.equal('com/c');
    });
});