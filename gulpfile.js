var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require ('gulp-uglify');
var eslint = require('eslint/lib/cli');
var globby = require('globby');


gulp.task('default', function(){
  gulp.start('lint');
})

// run eslint without an additional plugin
gulp.task('lint', function(done) {

  // patterns with the same form as gulp.src(patterns)
  var patterns = ['lib/**/*.{js,jsx}'];

  globby(patterns, function(err, paths) {
    if (err) {
      // unexpected failure, include stack
      done(err);
      return;
    }
    // additional CLI options can be added here
    var code = eslint.execute(paths.join(' '));
    if (code) {
      // eslint output already written, wrap up with a short message 
      done(new gutil.PluginError('lint', new Error('ESLint error')));
      return;
    }
    done();
  });
});