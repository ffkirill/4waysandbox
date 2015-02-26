var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var babel = require('babelify');

gulp.task('compile', function () {
    return browserify('./src/js/main.js')
        .transform(babel.configure({
            experimental: true,
            optional: ['runtime']
        }))
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('./dist/js/'));
});

gulp.task('static', function () {
    gulp.src('./src/index.html')
        .pipe(gulp.dest('./dist'));
    gulp.src('./src/css/*.css')
        .pipe(gulp.dest('./dist/css/'));
    gulp.src('./src/img/*.png')
        .pipe(gulp.dest('./dist/img/'));
});

gulp.task('build', ['compile', 'static']);

gulp.task('default', ['build']);