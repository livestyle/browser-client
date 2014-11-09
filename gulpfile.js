var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var streamify = require('gulp-streamify');
var through = require('through2');
var source = require('vinyl-source-stream');

gulp.task('build', function() {
	return browserify({
		entries: './index.js',
		detectGlobals: false
	})
	.bundle()
	.pipe(source('livestyle-client.js'))
	// .pipe(streamify(uglify()))
	.pipe(gulp.dest('./out'));
});

gulp.task('watch', function() {
	gulp.watch(['index.js'], ['build']);
});

gulp.task('default', ['build']);