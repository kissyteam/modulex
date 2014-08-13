var gulp = require('gulp');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var express = require('express');
var comboHandler = require('combo-handler');
var path = require('path');
var jscoverHandler = require('node-jscover-handler');
var nodeJsCoverCoveralls = require('node-jscover-coveralls');
var saucelabsRunner = require('saucelabs-runner');

gulp.task('build', function () {
    var files = ['modulex.js', 'logger.js',
        'utils.js', 'data-structure.js',
        'css-onload.js', 'get-script.js',
        'configs.js', 'combo-loader.js',
        'init.js', 'i18.js'];
    files.forEach(function (f, i) {
        files[i] = './lib/' + f;
    });

    gulp.src(files)
        .pipe(concat('modulex.js'))
        .pipe(gulp.dest('./build'));

    gulp.src(['./build/modulex.js', './lib/nodejs.js'])
        .pipe(concat('modulex-nodejs.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('default', ['server'], function () {
    gulp.watch('./lib/**/*.js', ['build']);
});

gulp.task('saucelabs', function () {
    saucelabsRunner([
        {
            testname: 'modulex',
            urls: ['http://localhost:8000/tests/runner.html']
        }
    ],'mocha');
});

gulp.task('server', function () {
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
    app.listen(8000);
    gutil.log('server start at 8000');
});