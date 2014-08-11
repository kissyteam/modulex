describe('core package', function () {
    var mx = modulex;

    it('can set individually', function (done) {
        mx.config({
            base: './specs/core-package',
            debug: false,
            packages: {
                'core-package-test': {
                    base: './specs/core-package/core-package-test'
                }
            },
            'node': {
                debug: true
            }
        });
        modulex.use(['t','core-package-test/t'], function (coreT, t) {
            expect(coreT).to.be.equal(1);
            expect(t).to.be.equal(2);
            done();
        });
    });
});