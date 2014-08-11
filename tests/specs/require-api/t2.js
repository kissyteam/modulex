modulex.add(function(require,exports,module) {
    module.exports = {
        init: function (fn) {
            require.async(['./t2-async'], fn);
        }
    };
});