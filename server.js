var serve = require('koa-static');
var cwd = process.cwd();
var path = require('path');
var app = require('koa')();
var fs = require('fs');
var root = cwd;
var serveIndex = require('koa-serve-index');
var koaBody = require('koa-body');
var jscoverHandler = require('koa-node-jscover');
var jscoverCoveralls = require('node-jscover-coveralls/lib/koa');
var comboHandler = require('combo-handler/lib/koa');
app.use(comboHandler());
app.use(function *(next) {
  if (path.extname(this.path) === '.jss') {
    var func = require(path.resolve(__dirname, this.path.substring(1))).call(this);
    yield *func;
  } else {
    yield *next;
  }
});
// parse application/x-www-form-urlencoded
app.use(koaBody());
app.use(jscoverHandler({
  jscover: require('node-jscover'),
  next: function () {
    return 1;
  }
}));
app.use(jscoverCoveralls());
app.use(serveIndex(root, {
  hidden: true,
  view: 'details'
}));
app.use(serve(root, {
  hidden: true
}));
var port = process.env.npm_package_config_port;
app.listen(port);
console.log('server start at ' + port);