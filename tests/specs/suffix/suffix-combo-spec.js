/*jshint quotmark:false*/
/*global $*/

describe("mod with suffix combo", function () {
    var mx = modulex;
    beforeEach(function () {
        modulex.config('combine', true);
    });

    afterEach(function () {
        modulex.clearLoader();
    });

    it("can load mod with a suffix when combo loader", function (done) {
        modulex.config({
            packages: {
                suffix: {
                    base: "./specs/suffix"
                }
            },
            modules: {
                "suffix/a.tpl": {
                    requires: ["./a.tpl.css"]
                }
            }
        });

        $("<div id='suffix-test'></div>").appendTo('body');

        mx.use(["suffix/a.tpl"], function (A) {
            expect(A).to.be.equal(1);
            expect($("#suffix-test").css("font-size")).to.be.equal("77px");
            done();
        });
    });
});