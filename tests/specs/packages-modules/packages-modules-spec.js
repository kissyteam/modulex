/**
 * tc for modules config
 * @author yiminghe@gmail.com
 */

describe('modules and packages', function () {
    var locationPrefix = location.protocol + '//' + location.host;
    var build = (location.href.indexOf('build') !== -1) ||
        (location.href.indexOf('min') !== -1);

    beforeEach(function () {
        modulex.config('combine', true);
    });

    afterEach(function () {
        modulex.clearLoader();
    });

    it('does not depend on order', function (done) {
        modulex.config({
            'modules': {
                'x/x': {
                    requires: ['x/y']
                }
            }
        });

        modulex.config('packages', {
            x: {
                base: '/tests/specs/packages-modules/x'
            }
        });

        modulex.use(['x/x'], function (X) {
            expect(X).to.be.equal(8);
            done();
        });
    });

    it('package can has same path', function (done) {
        modulex.config({
            packages: {
                y: {
                    base: '/tests/specs/packages-modules/y'
                },
                z: {
                    base: '/tests/specs/packages-modules/z'
                }
            }
        });

        modulex.use(['y/y', 'z/z'], function (y, z) {
            try {
                expect(y).to.be.equal(2);
                expect(z).to.be.equal(1);
            } catch (e) {
                done(e);
            }
            done();
        });
    });
});