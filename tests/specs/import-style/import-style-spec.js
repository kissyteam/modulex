describe('importStyle', function () {
    beforeEach(function () {
        modulex.clearLoader();
    });

    it('works', function () {
        modulex.config({
            'packages': {
                'a': {
                    combine: true,
                    base: '/a'
                },
                'b': {
                    base: '/b'
                }
            },
            'modules': {
                'a/a1.css': {
                    requires: ['./a2.css', './a3']
                },
                'b/b1.css': {
                    requires: ['b/b2.css']
                }
            }
        });
        var urls = modulex.importStyle(['a/a1.css', 'b/b1.css'], true).css;
        expect(urls.length).to.equal(3);
        expect(urls[0].url).to.equal('http://localhost:8000/a/??a1.css,a2.css');
        expect(urls[1].url).to.equal('http://localhost:8000/b/b1.css');
        expect(urls[2].url).to.equal('http://localhost:8000/b/b2.css');
        expect(modulex.Env.mods['a/a3'].status).to.equal(modulex.Loader.Status.UNLOADED);
        expect(modulex.Env.mods['a/a1.css'].status).to.equal(modulex.Loader.Status.INITIALIZED);
    });
});