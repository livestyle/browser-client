var gulp = require('gulp');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');
var through = require('through2');
var jsBundler = require('js-bundler');
var notifier = require('node-notifier');

var production = process.argv.indexOf('--production') !== -1;

function js(options) {
	return jsBundler(options).on('error', function(err) {
		notifier.notify({
			title: 'Error', 
			message: err,
			sound: true
		});
		console.error(err.stack || err);
		this.emit('end');
	});
}

gulp.task('js', function() {
	return gulp.src('./livestyle-*.js')
		.pipe(js({
			sourceMap: !production,
			detectGlobals: false,
			global: true
		}))
		.pipe(production ? uglify() : through.obj())
		.pipe(gulp.dest('./out'));
});

gulp.task('full', ['build'], function() {
	return gulp.src('**/*.{html,css,js,ico}', {cwd: './out'})
		.pipe(gzip({
			threshold: '1kb',
			gzipOptions: {level: 7}
		}))
		.pipe(gulp.dest('./out'));
});

gulp.task('watch', function() {
	jsBundler.watch({sourceMap: true});
	gulp.watch(['./livestyle-*.js'], ['js']);
});

gulp.task('build', ['js']);
gulp.task('default', ['build']);