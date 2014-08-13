describe('core package', function () {
    var mx = modulex;

    beforeEach(function () {
        mx.config({
            combine: false
        });
    });

    it('can set individually', function (done) {
        mx.config({
            base: '/tests/specs/core-package',
            packages: {
                core: {
                    filter: ''
                },
                'core-package-test': {
                    filter: 'min',
                    base: '/tests/specs/core-package/core-package-test'
                }
            }
        });
        modulex.use(['t', 'core-package-test/t'], function (coreT, t) {
            expect(coreT).to.be.equal(1);
            expect(t).to.be.equal(2);
            done();
        });
    });
});