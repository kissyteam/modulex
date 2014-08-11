modulex.add("tests3/b", function (c) {
    return c + 2;
}, {
    requires:['./c']
});