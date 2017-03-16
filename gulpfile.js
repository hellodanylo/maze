const path = require('path');

const gulp = require('gulp');
gulp.source = require('vinyl-source-stream')

const browserify = require('browserify');
const babelify = require('babelify');
const watchify = require('watchify');

const JS_SOURCE = path.join(__dirname, 'js'); 
const JS_ENTRY = path.join(JS_SOURCE, 'app.js');
const JS_BUNDLE = 'bundle.js';
const DEST = path.join(__dirname, 'dist');

const STATIC_GLOBS = [
  path.join(__dirname, 'css', '*'),
  path.join(__dirname, 'img', '*'),
  path.join(__dirname, 'sounds', '*'),
  path.join(__dirname, 'node_modules', 'react', 'dist', 'react.js'),
  path.join(__dirname, 'node_modules', 'react-dom', 'dist', 'react-dom.js')
];

const bundler = browserify({
  entries: JS_ENTRY,
  debug: true
}).transform('babelify', {
  presets: [['react']], 
  plugins: [
    'transform-async-to-generator', 
    'transform-es2015-modules-commonjs'
  ]
});

function bundle(){
  return bundler.bundle()
    .on('error', console.error.bind(console))
    .pipe(gulp.source(JS_BUNDLE))
    .pipe(gulp.dest(DEST));
}

function bundleAndwatch() {
  return watchify(bundler).bundle()
    .on('error', console.error.bind(console))
    .pipe(gulp.source(JS_BUNDLE))
    .pipe(gulp.dest(DEST));
}

bundler.on('update', bundle);
bundler.on('log', msg => console.log(msg));
gulp.task('bundle', bundle);

gulp.task('static', _ => {
  return gulp.src(STATIC_GLOBS)
    .pipe(gulp.dest(DEST));
});

gulp.task('build', ['bundle', 'static']);

gulp.task('build-watch', ['build'], function(done) {
  gulp.watch(STATIC_GLOBS, ['static']);
  bundleAndwatch();
});