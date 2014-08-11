expect(window.TEST_A || 0).to.be.equal(0);
modulex.add("tests2/a", function (b) {
    window.TEST_A = 1;
    return b + 4;
}, {
    requires:['./b']
});