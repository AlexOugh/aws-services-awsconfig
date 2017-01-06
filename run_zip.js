
var gulp = require('gulp'),
vfs = require('vinyl-fs'),
zip = require('gulp-zip');

vfs.src(['index.js', 'node_modules/aws-services-lib/flow_controller.js', 'node_modules/aws-services-lib/aws/*.js', 'json'],{cwd:'.', base:'.'})
.pipe(zip('awsconfig.zip'))
.pipe(gulp.dest('.'))
.on('end', function(err, data) {
  if (err)  console.log("failed : " + err);
  else console.log('completed');
});
