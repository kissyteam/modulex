var gulp = require('gulp');
var concat = require('gulp-concat');
var saucelabsRunner = require('saucelabs-runner');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var footer = require('gulp-footer');
var fs = require('fs');
var clone = require('gulp-clone');

gulp.task('build', function () {
    var files = ['modulex.js', 'logger.js',
        'utils.js', 'data-structure.js',
        'css-onload.js', 'get-script.js',
        'configs.js', 'combo-loader.js',
        'init.js', 'i18.js'];
    files.forEach(function (f, i) {
        files[i] = './lib/' + f;
    });

    var concatFile = gulp.src(files)
        .pipe(concat('modulex-debug.js'))
        .pipe(gulp.dest('./build'));
    var concatFile2 = concatFile.pipe(clone());
    
    concatFile.pipe(replace(/@DEBUG@/g, ''))
        .pipe(replace(/@TIMESTAMP@/g, new Date().toUTCString()))
        .pipe(uglify())
        .pipe(rename('modulex.js'))
        .pipe(gulp.dest('./build'));

    concatFile2.pipe(footer(fs.readFileSync('./lib/nodejs.js', 'utf-8')))
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
    ], 'mocha');
});

gulp.task('server', function () {
    require('./server');
});