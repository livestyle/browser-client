var gulp = require('gulp');
var jsBundler = require('js-bundler');
var rename = require('gulp-rename');
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
	return gulp.src('./index.js')
		.pipe(js({
			standalone: 'livestyleClient',
			sourceMap: !production,
			detectGlobals: false
		}))
		.pipe(rename('livestyle-client.js'))
		.pipe(gulp.dest('./out'));
});

gulp.task('watch', function() {
	jsBundler.watch({sourceMap: true});
	gulp.watch(['index.js'], ['js']);
});

gulp.task('default', ['js']);