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
var packageInfo = require('./package.json');

var files = ['modulex.js',
    'utils.js', 'data-structure.js',
    'css-onload.js', 'get-script.js',
    'configs.js', 'combo-loader.js',
    'init.js', 'i18n.js'];

files.forEach(function (f, i) {
    files[i] = './lib/' + f;
});

gulp.task('lint', function () {
    return gulp.src('lib/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .pipe(jscs());
});

gulp.task('default', ['lint'], function () {
    var concatFile = gulp.src(files)
        .pipe(replace(/@VERSION@/g, packageInfo.version))
        .pipe(replace(/@TIMESTAMP@/g, new Date().toUTCString()))
        .pipe(concat('modulex-debug.js'))
        .pipe(gulp.dest('./build'));

    var concatFile2 = concatFile.pipe(clone());

    concatFile.pipe(replace(/@DEBUG@/g, ''))
        .pipe(uglify())
        .pipe(rename('modulex.js'))
        .pipe(gulp.dest('./build'));

    concatFile2.pipe(footer(fs.readFileSync('./lib/nodejs.js', 'utf-8')))
        .pipe(concat('modulex-nodejs.js'))
        .pipe(gulp.dest('./build'));

    gulp.src('lib/import-style.js')
        .pipe(rename('import-style-debug.js'))
        .pipe(gulp.dest('./build'))
        .pipe(uglify())
        .pipe(rename('import-style.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('watch', function () {
    gulp.watch('./lib/**/*.js', ['default']);
});

gulp.task('saucelabs', function () {
    saucelabsRunner([
        {
            testname: 'modulex',
            urls: ['http://localhost:8000/tests/runner.html']
        }
    ], 'mocha');
});