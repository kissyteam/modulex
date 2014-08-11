module.exports = function (req, res) {
    setTimeout(function () {
        res.set('Content-Type', 'text/javascript');
        res.send('modulex.add(function(){ return 1;})');
    }, 5000);
};