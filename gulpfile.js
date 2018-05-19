var gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss    = require('gulp-postcss'),
    combineSeclectors =require('postcss-combine-duplicated-selectors'),
    prefixer = require('gulp-autoprefixer'),
    mqpacker = require("css-mqpacker"),
    cssnano = require('cssnano'),
    // cleancss = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    browserSync = require('browser-sync').create(),
    rimraf = require('rimraf'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    // uglifyes = require('gulp-uglifyes'), // Gulp plugin, compressed es6+ code.
    // babel = require('gulp-babel'),
    pump = require('pump');

var path = {
    dist: {
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    app: {
        html: 'app/*.html',
        js: 'app/js/main.js',
        style: 'app/sass/main.+(scss|sass)',
        img: 'app/img/**/',
        fonts: 'app/fonts/**/*.*'
    },
    watch: {
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        style: 'app/sass/**/*.+(scss|sass)',
        img: 'app/img/**/*',
        fonts: 'app/fonts/**/*.*'
    },
    clean: './dist'
};

gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "dist"
        },
        notify: false,
        // tunnel: true,
        // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
    });
});

gulp.task('html:build', function () {
    return gulp.src(path.app.html)
        .pipe(gulp.dest(path.dist.html))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('style:build', function () {
        gulp.src(path.app.style)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(prefixer(['last 2 versions']))
        .pipe(postcss([mqpacker(), combineSeclectors(),
            cssnano({"preset": "advanced"})
        ]))
        // .pipe(prefixer(['last 2 versions']))
        // .pipe(cleancss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.dist.css))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src('app/js/*.js')
        // .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init())
        // .pipe(babel())
        .pipe(concat('main.js'))
        // .pipe(uglifyes())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.dist.js))
        .pipe(browserSync.reload({stream: true}));
});

// gulp.task('babel', function () {
//     gulp.src('app/*.js')
//         .pipe(babel({
//             presets: ['env']
//         }))
//         .pipe(gulp.dest(path.dist.js))
// }
// );

// gulp.task('debug', function (cb) {
//   pump([
//     gulp.src('app/**/*.js'),
//     uglify(),
//     gulp.dest('./dist/js')
//   ], cb);
// });

gulp.task('image:build', function () {
    return gulp.src(path.app.img)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
                ]
            })
        ],{verbose: true}))
        .pipe(gulp.dest(path.dist.img))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.app.fonts)
        .pipe(gulp.dest(path.dist.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);


gulp.task('watch', function(){
    gulp.watch([path.watch.html], ['html:build']);
    gulp.watch([path.watch.style], ['style:build']);
    gulp.watch([path.watch.js], ['js:build']);
    gulp.watch([path.watch.img], ['image:build']);
    gulp.watch([path.watch.fonts], ['fonts:build']);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'server', 'watch']);
