var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var sourcemaps = require('gulp-sourcemaps');

function compile() {
  return tsProject.src().
      pipe(sourcemaps.init({loadMaps: true})).
      pipe(tsProject())
      // .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '../src' }))
      .pipe(sourcemaps.write()).
      pipe(gulp.dest('lib'));
}

function watch(cb) {
  gulp.watch('src/**/*', {ignoreInitial: false}, compile);
  cb();
}

exports.compile = compile;
exports.watch = watch;
exports.default = compile;
