var run = function (combine) {
    describe('sync loading ' + (combine ? 'at combo mode' : ''), function () {
        beforeEach(function () {
            modulex.clearLoader();
            modulex.config('combine', !!combine);
        });

        it('is sync', function () {
            modulex.add('test-sync', function () {
                return 1;
            });

            var t;

            modulex.use(['test-sync'], {
                success: function (x) {
                    t = x;
                }
            });

            expect(t).to.be.equal(1);
        });
    });
};

run();
run(1);
