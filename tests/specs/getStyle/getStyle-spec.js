/**
 * test loader
 * @author yiminghe@gmail.com
 */
/*jshint quotmark:false*/
/*global $*/
(function (mx) {
    var d = window.location.href.replace(/[^/]*$/, "") + "../specs/";

    describe("getStyle", function () {
        it("should callback after css onload", function (done) {
            var html = "<div id='special'>33px</div><div id='special2'>44px</div>";

            $(html).appendTo('body');

            var state = 0;

            expect($('#special').css('height')).not.to.be.equal("330px");

            mx.getScript(d + "getStyle/height.css", function () {

                expect($('#special').css('height')).to.be.equal("330px");
                state++;
                // breath
                ret();

            });

            // cross domain
            var d2 = d.replace(":8888", ":9999");
            mx.getScript(d2 + "getStyle/height2.css", function () {

                expect($('#special2').css('height')).to.be.equal("440px");
                state++;
                ret();
            });

            function ret() {
                if (state === 2) {
                    $('#special').remove();
                    $('#special2').remove();
                    done();
                }
            }
        });
    });
})(modulex);

