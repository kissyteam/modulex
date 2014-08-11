/*jshint quotmark:false*/
describe("timestamp for individual module works in combine mode", function () {
    var mx = modulex;
    var Utils = mx.Loader.Utils;
    var host = location.host;

    beforeEach(function () {
        window.TIMESTAMP_X = 0;
        mx.config('combine', true);
    });

    afterEach(function () {
        mx.clearLoader();
        try {
            delete window.TIMESTAMP_X;
        } catch (e) {
            window.TIMESTAMP_X = undefined;
        }
    });

    it("works theoretically", function () {
        modulex.config({
            base: '',
            tag: '',
            debug: true,
            packages: {
                'timestamp': {
                    tag: 'a',
                    base: './specs/timestamp'
                }
            },
            modules: {
                'timestamp/x': {
                    requires: ['./z']
                },
                'timestamp/y': {
                    requires: ['./x']
                },
                'timestamp/z': {
                    tag: 'z'
                }
            }
        });

        var loader = new mx.Loader.ComboLoader();

        var allMods = loader.calculate(Utils.createModules(["timestamp/y"]));

        var comboUrls = loader.getComboUrls(allMods);

        expect(comboUrls.js[0].url)
            .to.be.equal("http://" + host +
                "/modulex/tests/specs/timestamp/??y.js,x.js,z.js?t=a.js");
    });

    it("works practically", function (done) {
        window.TIMESTAMP_X = 0;
        modulex.config({
            base: '',
            tag: '',
            debug: true,
            packages: {
                'timestamp': {
                    tag: 'a',
                    base: './specs/timestamp'
                }
            },
            modules: {
                'timestamp/x': {
                    tag: 'b',
                    requires: ['./z']
                },
                'timestamp/y': {
                    requires: ['./x']
                },
                'timestamp/z': {
                    tag: 'z'
                }
            }
        });

        mx.use(['timestamp/y'], function (Y) {
            expect(Y).to.be.equal(1);
            done();
        });
    });

    it("works theoretically when package has no combo", function () {
        window.TIMESTAMP_X = 0;
        modulex.config({
            base: '',
            tag: '',
            debug: true,
            packages: {
                'timestamp': {
                    combine: false,
                    tag: 'a',
                    base: './specs/timestamp'
                }
            },
            modules: {
                'timestamp/x': {
                    tag: 'b',
                    requires: ['./z']
                },
                'timestamp/y': {
                    requires: ['./x']
                },
                'timestamp/z': {
                    tag: 'z'
                }
            }
        });

        var loader = new mx.Loader.ComboLoader();

        var allMods = loader.calculate(Utils.createModules(["timestamp/y"]));

        var comboUrls = loader.getComboUrls(allMods);

        var jss = comboUrls.js;

        expect(jss[0].url).to.be.equal("http://" + host + "/modulex/tests/specs/timestamp/y.js?t=a.js");
        expect(jss[1].url).to.be.equal("http://" + host + "/modulex/tests/specs/timestamp/x.js?t=b.js");
        expect(jss[2].url).to.be.equal("http://" + host + "/modulex/tests/specs/timestamp/z.js?t=z.js");
    });

    it("works practically when package has no combo", function (done) {
        window.TIMESTAMP_X = 0;
        modulex.config({
            base: '',
            tag: '',
            debug: true,
            packages: {
                'timestamp': {
                    combine: false,
                    tag: 'a',
                    base: './specs/timestamp'
                }
            },
            modules: {
                'timestamp/x': {
                    tag: 'b',
                    requires: ['./z']
                },
                'timestamp/y': {
                    requires: ['./x']
                },
                'timestamp/z': {
                    tag: 'z'
                }
            }
        });

        mx.use(['timestamp/y'], function (Y) {
            expect(Y).to.be.equal(1);
            done();
        });
    });
});
