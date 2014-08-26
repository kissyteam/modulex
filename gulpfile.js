var gulp = require('gulp');
var concat = require('gulp-concat');
var saucelabsRunner = require('saucelabs-runner');
var replace = require('gulp-replace');

var rename = require('gulp-rename');
var footer = require('gulp-footer');
var fs = require('fs');
var clone = require('gulp-clone');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var jscs = require('gulp-jscs');

var files = ['modulex.js', 'logger.js',
        'utils.js', 'data-structure.js',
        'css-onload.js', 'get-script.js',
        'configs.js', 'combo-loader.js',
        'init.js', 'i18n.js'];
    files.forEach(function (f, i) {
        files[i] = './lib/' + f;
    });
    
var sources = gulp.src(files);
gulp.task('lint',function(){
    return sources
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .pipe(jscs());
});

gulp.task('build', ['lint'], function () {
    var concatFile = sources
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

gulp.task('default',function () {
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