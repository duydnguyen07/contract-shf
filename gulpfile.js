var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var gulpIf = require('gulp-if');
var concat = require('gulp-concat');
var pkg = require('./package.json');

var outputDir;
var env = process.env.NODE_ENV || 'development';

if (env==='development') {
    outputDir = 'builds/development/';
} else {
    outputDir = 'builds/production/';
}

var devPath = 'builds/development/';
var jsSrcs = [devPath+'js/new-age.js', devPath+'js/app.js']; 
var componentHtmlSrcs = [devPath+'components/**/*.html']; 


// Set the banner content
var banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');

// Compile LESS files from /less into /css
gulp.task('less', function() {
    return gulp.src(devPath+'less/new-age.less')
        .pipe(less())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest(devPath+'css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function() {
    return gulp.src(devPath+'css/new-age.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(outputDir+'css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src(jsSrcs)
        .pipe(concat('script.js'))
        .pipe(gulpIf(env==='production',uglify()))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(outputDir+'js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('minify-html', function() {
    return gulp.src(devPath+"index.html")
           .pipe(gulpIf(env==='production', minifyHtml()))
           .pipe(gulpIf(env==='production', gulp.dest(outputDir)));
});

gulp.task('minify-component-html', function() {
    return gulp.src(componentHtmlSrcs)
           .pipe(gulpIf(env==='production', minifyHtml()))
           .pipe(gulpIf(env==='production', gulp.dest(outputDir+"components")));
});

gulp.task('images', function() {
    return gulp.src(devPath+"img/*")
           .pipe(gulpIf(env==='production',gulp.dest(outputDir+"img")));
});

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', function() {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest(outputDir+'vendor/bootstrap'))

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest(outputDir+'vendor/jquery'))

    gulp.src(['node_modules/simple-line-icons/*/*'])
        .pipe(gulp.dest(outputDir+'vendor/simple-line-icons'))

    gulp.src(['node_modules/angular/angular.min.js'])
        .pipe(gulp.dest(outputDir+'vendor/angular'));
            
    gulp.src(['node_modules/angular-modal-service/dst/angular-modal-service.min.js'])
        .pipe(gulp.dest(outputDir+'vendor/angular-modal-service/dst'))

    gulp.src(['node_modules/angularfire/dist/angularfire.min.js'])
        .pipe(gulp.dest(outputDir+'vendor/angularfire/dist'))
    
    gulp.src(['node_modules/firebase/firebase.js'])
        .pipe(gulp.dest(outputDir+'vendor/firebase'))

    gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest(outputDir+'vendor/font-awesome'))
})

// Run everything
gulp.task('default', ['less', 'minify-css', 'minify-js', 'minify-html', 'images', 'minify-component-html', 'copy']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: outputDir
        },
    })
})

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'less', 'minify-css', 'minify-js', 'minify-html', 'images', 'minify-component-html'], function() {
    gulp.watch(devPath+'less/*.less', ['less']);
    gulp.watch(devPath+'css/*.css', ['minify-css']);
    gulp.watch(devPath+'js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch(devPath+'*.html', browserSync.reload);
    gulp.watch(devPath+'components/**/*.html', browserSync.reload);
    gulp.watch(devPath+'js/**/*.js', browserSync.reload);
});
