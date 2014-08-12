/**
 * test loader
 * @author yiminghe@gmail.com
 */
/*jshint quotmark:false*/
/*global $*/
(function (mx) {
    var d = "./specs/";

    describe("getStyle", function () {
        it("should callback after css onload", function (done) {
            var html = "<div id='special'>33px</div><div id='special2'>44px</div>";
            $(html).appendTo('body');
            var state = 0;
            expect($('#special').css('height')).not.to.be.equal("330px");
            mx.getScript(d + "getStyle/height.css", function () {
                // do not know why?
                setTimeout(function () {
                    expect($('#special').css('height')).to.be.equal("330px");
                    state++;
                    // breath
                    ret();
                }, 100);
            });
            expect($('#special2').css('height')).not.to.be.equal("440px");
            // cross domain
            mx.getScript("http://127.0.0.1:8000/tests/specs/getStyle/height2.css", function () {
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

