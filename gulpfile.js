var gulp = require('gulp'),
    inline = require('gulp-inline'),
    uglify = require('gulp-uglify'),
    templateCache = require('gulp-angular-templatecache'),
    minifyCSS = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
    autoprefixer = require('gulp-autoprefixer'),
    less = require('gulp-less'),
    chain = require('gulp-chain');

var cssChain = chain(function(stream) {
  return stream
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(minifyCSS());
});

gulp.task('templates', function() {
  gulp.src('www/templates/**/*.html')
    .pipe(templateCache({
      standalone: true
    }))
    .pipe(gulp.dest('www/templates'));
})

gulp.task('default', ['templates'], function () {
  gulp.src('www/fonts/**/*')
    .pipe(gulp.dest('build/www/fonts/'));

  gulp.src('www/index.html')
    .pipe(inline({
      base: 'www/',
      css: cssChain(),
      disabledTypes: ['svg', 'img']
    }))
    .pipe(minifyHTML())
    .pipe(gulp.dest('build/www/'));
});

gulp.task('watch', ['default'], function() {
  return gulp.watch('www/**/*', ['default']);
});
