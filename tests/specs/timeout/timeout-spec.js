describe('timeout', function () {
    var mx = modulex;

    var timeout;

    beforeEach(function () {
        timeout = mx.config('timeout') || 0;
        mx.config({
            combine: false,
            timeout: 1
        });
    });

    afterEach(function () {
        mx.config({
            timeout: timeout
        });
        mx.clearLoader();
    });

    it('works for use', function (done) {
        mx.config({
            modules: {
                'timeout/use': {
                    url: './specs/timeout/use.jss?' + mx.Loader.Utils.now()
                }
            }
        });

        mx.use(['timeout/use'], {
            success: function (d) {
                expect(d).to.be.equal(1);
                done();
            },
            error: function () {
                done();
            }
        });
    });

    it('works for use2', function (done) {
        mx.config({
            packages: {
                timeout: {
                    base: './specs/timeout'
                }
            },
            modules: {
                'timeout/r2': {
                    url: './specs/timeout/r2.jss?' + mx.Loader.Utils.now()
                }
            }
        });
        mx.use(['timeout/r'], {
            error: function () {
                done();
            }
        });
    });
});