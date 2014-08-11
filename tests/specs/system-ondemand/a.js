
modulex.add('p-c/a', ['./b'], function (require) {
    var b = require('./b');
    return b + 1;
});
modulex.add('p-c/b', ['./c'], function () {
    return 3;
});