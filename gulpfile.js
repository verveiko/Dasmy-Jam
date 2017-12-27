const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const useref = require('gulp-useref');
const uglify = require('gulp-uglify');
const composer = require('gulp-uglify/composer');
const uglifyES = require('uglify-es');
const gulpIf = require('gulp-if');
const cssNano = require('gulp-cssnano');
const htmlMin = require('gulp-htmlmin');
const imageMin = require('gulp-imagemin');
const cache = require('gulp-cache');
const del = require('del');
const runSequence = require('run-sequence');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const filter = require('gulp-filter');

const minify = composer(uglifyES);

// Intro Hello Task...
gulp.task('hello', function() {
  console.log('Hello, Michael');
});

// SASS Task
gulp.task('sass', function(){
	return gulp.src('dev/scss/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dev/styles'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

// Watch Task
gulp.task('watch', function(){
	gulp.watch('dev/scss/**/*.scss', ['sass']);
	gulp.watch('dev/*.html', browserSync.reload);
	gulp.watch('dev/scripts/**/*.js', browserSync.reload);
});

// BrowserSync Task
gulp.task('browserSync', function(){
	browserSync.init({
		server: {
			baseDir: 'dev'
		}
	});
});

// Useref Task
gulp.task('useref', function(){

	const f = filter(['**/*.css', '**/*.js'], {restore: true});

	return gulp.src('dev/*.html')
		.pipe(useref())
		.pipe(gulpIf('*.js', minify()))
		.pipe(gulpIf('*.css', cssNano()))
		.pipe(gulpIf('*.html', htmlMin({collapseWhitespace: true})))
		.pipe(f)
		.pipe(rev())
		.pipe(f.restore)
		.pipe(revReplace())
		.pipe(gulp.dest('dist'));
});

// Image Optimization Task
gulp.task('images', function(){
	return gulp.src('dev/images/**/*.+(png|jpg|gif|svg)')
		.pipe(cache(imageMin({
			interlaced: true
		})))
		.pipe(gulp.dest('dist/images'));
});

// Fonts Task
gulp.task('fonts', function(){
	return gulp.src('dev/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));
});

// Clean Dist Folder Task
gulp.task('clean:dist', function(){
	return del.sync('dist');
});

// Default Task
gulp.task('default', function() {
  runSequence(['sass', 'browserSync'], 'watch');
});

// Build Task
gulp.task('build', function(){
	runSequence('clean:dist', 'sass', ['useref', 'images', 'fonts']);
});
