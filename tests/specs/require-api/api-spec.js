describe('support require api in modulex.add', function () {
    beforeEach(function () {
        modulex.config({
            combine: false
        });
    });

    afterEach(function () {
        modulex.clearLoader();
    });

    it('async and toUrl works', function (done) {
        modulex.config('packages', {
            't': {
                tag: 2,
                base: './specs/require-api'
            }
        });
        var ret1 = Q.defer();
        var ret2 = Q.defer();

        modulex.use(['t/t1', 't/t2'], function (t1, t2) {
            t1.init(function (tt1) {
                ret1.resolve(tt1);
            });

            t2.init(function (tt2) {
                ret2.resolve(tt2);
            });

            Q.all([ret1.promise, ret2.promise]).then(function (v) {
                var ee;
                try {
                    expect(v[0]).to.be.equal('http://' + location.host + '/tests/specs/require-api/x.css');
                    expect(v[1]).to.be.equal(2);
                } catch (e) {
                    ee = e;
                }
                done(ee);
            });
        });
    });
});