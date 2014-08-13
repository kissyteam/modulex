var gutil = require('gulp-util');
var express = require('express');
var comboHandler = require('combo-handler');
var path = require('path');
var jscoverHandler = require('node-jscover-handler');
var nodeJsCoverCoveralls = require('node-jscover-coveralls');

var app = express();
app.use(express.bodyParser());
app.use(comboHandler());
app.use(nodeJsCoverCoveralls());
app.use(jscoverHandler());
app.use(function (req, res, next) {
    if (path.extname(req.path) === '.jss') {
        require(path.resolve(__dirname, req.path.substring(1)))(req, res);
    } else {
        next();
    }
});
app.use(express.directory(__dirname, {
    hidden: true
}));
app.use(express['static'](__dirname, {
    hidden: true
}));
var port = process.env.PORT || 8000;
app.listen(port);
gutil.log('server start at ' + port);