var gulp = require('gulp');
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
			global: true,
			uglify: production
		}))
		.pipe(gulp.dest('./out'));
});

gulp.task('watch', function() {
	jsBundler.watch({sourceMap: true});
	gulp.watch(['./livestyle-*.js'], ['js']);
});

gulp.task('default', ['js']);