'use strict';


const gulp = require('gulp');
const watch = require('gulp-watch');
const prefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rigger = require('gulp-rigger');
const cssmin = require('gulp-minify-css');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const rimraf = require('rimraf');
const browserSync = require("browser-sync");
const reload = browserSync.reload;


var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        php: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { // Пути откуда брать исходники
        php: 'source/index.php',
        js: 'source/js/main.js',
        style: 'source/style/main.sass',
        img: 'source/img/**/*.*', 
        fonts: 'source/fonts/**/*.*'
    },
    watch: { // Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        template: 'source/**/*.php',
        js: 'source/js/**/*.js',
        style: 'source/style/**/*.sass',
        img: 'source/img/**/*.*',
        fonts: 'source/fonts/**/*.*'
    },
    clean: './build'
};


/* ------------ PHP build ------------- */
gulp.task('php:build', function() {
	return gulp.src(path.src.php)
		.pipe(gulp.dest(path.build.php));
});


/* ------------ js build ------------- */
gulp.task('js:build', function() {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});


/* ------------ Style build ------------- */
gulp.task('style:build', function() {
    gulp.src(path.src.style) // Выберем наш main.scss
        .pipe(sourcemaps.init()) // То же самое что и с js
        .pipe(sass()) // Скомпилируем
        .pipe(prefixer()) // Добавим вендорные префиксы
        .pipe(cssmin()) // Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) // И в build
        .pipe(reload({stream: true}));
});


/* ------------ Image build ------------- */
gulp.task('image:build', function() {
    gulp.src(path.src.img) // Выберем наши картинки
        .pipe(imagemin({ // Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) // И бросим в build
        .pipe(reload({stream: true}));
});


/* ------------ Fonts build ------------- */
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});
 

/* ------------ Building ------------- */
gulp.task('build', function() {
    return [
        'php:build',
        'js:build',
        'style:build',
        'fonts:build',
        'image:build'
    ];
});


/* ------------ Watchers ------------- */
gulp.task('watch', function() {
    gulp.watch(path.watch.php, gulp.series('php:build'));
    gulp.watch(path.watch.style, gulp.series('style:build'));
    gulp.watch(path.watch.js, gulp.series('js:build'));
    gulp.watch(path.watch.img, gulp.series('image:build'));
    gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
});


/* ------------ Local sserver for livereload ------------- */
gulp.task('browser-sync', function(){
    browserSync.init({
        proxy: "scorp-project.dev",
        port: 9000,
        notify: false
    });
})


/* ------------ Clean ------------- */
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});


/* ------------ Start ------------- */
gulp.task('default', gulp.series(
    gulp.parallel('build', 'browser-sync', 'watch')
));