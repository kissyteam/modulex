var gulp = require('gulp');
var concat = require('gulp-concat');
var gutil = require('gulp-util');

gulp.task('default', function () {
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

    gulp.src(['./build/modulex.js','./lib/nodejs.js'])
        .pipe(concat('modulex-nodejs.js'))
        .pipe(gulp.dest('./build'));
});

var express = require('express');
var comboHandler = require('combo-handler');
var path = require('path');

gulp.task('server', function () {
    var app = express();
    app.use('/modulex/', comboHandler({
        base: __dirname
    }));
    app.use('/modulex/', function (req, res, next) {
        if (path.extname(req.path) === '.jss') {
            require(path.resolve(__dirname, req.path.substring(1)))(req, res);
        } else {
            next();
        }
    });
    app.use('/modulex/', express.directory(__dirname, {
        hidden: true
    }));
    app.use('/modulex/', express['static'](__dirname, {
        hidden: true
    }));
    app.listen(8000);
    gutil.log('server start at 8000');
});