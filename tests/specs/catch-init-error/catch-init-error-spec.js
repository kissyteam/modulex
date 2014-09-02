describe('module init error', function () {
    beforeEach(function () {
        modulex.Config.debug = 0;
        modulex.config({
            onModInitError: function () {
            },

            'packages': {
                err: {
                    base: '/tests/specs/catch-init-error/mods'
                }
            }});
    });
    afterEach(function () {
        modulex.clearLoader();
        modulex.Config.debug = 1;
    });
    it('will catch module initialize error', function (done) {
        modulex.use('err/a', {
            success: function () {

            }, error: function (e1, e2) {
                expect(e2.name).to.equal('err/a-b-c');
                expect(e1.name).to.equal('err/a-d');
                done();
            }});
    });
});