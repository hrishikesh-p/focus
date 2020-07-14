const gulp = require('gulp');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');

gulp.task('build', async function() {
  // js
  console.log('Compressing js...');
  await gulp.src(['./scripts/*.js'])
    .pipe(size({ title: 'JS before build :: ', showFiles: true, showTotal: false }))
    .pipe(minify({
      ext: {
         min:'.js',
      },
      noSource: true
    }))
    .pipe(gulp.dest('build/scripts'))
    .pipe(size({ title: 'JS after build 🔨:: ', showFiles: true, showTotal: false }))

  // css
  console.log('Compressing css...');
  await gulp.src(['./styles/*.css'])
    .pipe(size({ title: 'CSS before build :: ', showFiles: true }))
    .pipe(cleanCSS())
    .pipe(gulp.dest('build/styles'))
    .pipe(size({ title: 'CSS after build 🔨:: ', showFiles: true }))

  console.log('Compressing html...');
  await gulp.src(['./index.html'])
    .pipe(size({ title: 'HTML before build :: ', showFiles: true }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'))
    .pipe(size({ title: 'HTML after build 🔨:: ', showFiles: true }))


  console.log('Copying assets to build...');
  await gulp.src(['./sounds/*']).pipe(gulp.dest('build/sounds'));
  await gulp.src(['./favicon.ico']).pipe(gulp.dest('build'));

  console.log('🎉 Build done');
});