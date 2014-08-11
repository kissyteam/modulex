describe('mx.getLogger', function () {
    var mx = modulex;
    var loggerCfg = mx.config('logger');
    afterEach(function () {
        mx.config('logger', loggerCfg);
    });
    it('default works', function () {
        var logger = mx.getLogger('my');
        expect(logger.debug('x')).to.be.equal('my: x');
        // default exclude modulex
        logger = mx.getLogger('modulex');
        expect(!!logger.debug('x')).to.be.equal(false);
    });
    it('includes works', function () {
        mx.config('logger', {
            includes: [
                {logger: /^xx\//}
            ]
        });
        var logger = mx.getLogger('xx/y');
        expect(logger.debug('x')).to.be.equal('xx/y: x');
        logger = mx.getLogger('zz/x');
        expect(!!logger.debug('x')).to.be.equal(false);
    });
    it('excludes works', function () {
        mx.config('logger', {
            excludes: [
                {logger: /^yy\//}
            ]
        });
        var logger = mx.getLogger('xx/y');
        expect(logger.debug('x')).to.be.equal('xx/y: x');
        logger = mx.getLogger('yy/x');
        expect(!!logger.debug('x')).to.be.equal(false);
    });
    it('includes precede excludes works', function () {
        mx.config('logger', {
            includes: [
                {logger: /^xx\//}
            ],
            excludes: [
                {logger: /^xx\//}
            ]
        });
        var logger = mx.getLogger('xx/y');
        expect(logger.debug('x')).to.be.equal('xx/y: x');
        logger = mx.getLogger('yy/x');
        expect(!!logger.debug('x')).to.be.equal(false);
    });
    it('level works', function () {
        mx.config('logger', {
            excludes: [
                {
                    logger: /^xx\//,
                    maxLevel: 'info'
                }
            ]
        });
        var logger = mx.getLogger('xx/y');
        expect(!!logger.debug('x')).to.be.equal(false);
        expect(!!logger.info('x')).to.be.equal(false);
        expect(logger.warn('x')).to.be.equal('xx/y: x');
        expect(logger.error('x')).to.be.equal('xx/y: x');
    });
});