modulex.add("tests/b", function (c) {
    return c + 2;
}, {
    requires:['./c']
});