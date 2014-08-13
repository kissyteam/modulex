var gulp = require('gulp');
var concat = require('gulp-concat');
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
    require('./server');
});