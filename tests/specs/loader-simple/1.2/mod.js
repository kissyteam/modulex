modulex.add('1.2/mod', function (D) {
    expect(this.getUrl().replace(/\?.+$/, ''))
        .to.be.equal('http://' + location.host + '/modulex/tests/specs/loader-simple/1.2/mod.js');
    return D + 1;
}, {
    requires: ['./dep', './mod.css']
});