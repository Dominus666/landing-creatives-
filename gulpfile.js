var gulp         = require('gulp'), // подключаем gulp
    scss         = require('gulp-sass'), // подключаем scss
    rigger       = require('gulp-rigger'), // импортирует файлы
    uglify       = require('gulp-uglify'), // минифицирование JS
    concat       = require('gulp-concat'), // 
    order        = require('gulp-order'), //управляет последовательностью файлов
    minifyCss    = require('gulp-minify-css'), //сжимает css
    imagemin     = require('gulp-imagemin'), //сжимает картинки .png .jpeg .gif .svg
    cache        = require('gulp-cache'), // кеширует файлы
    pngquant     = require('imagemin-pngquant'), // сжатие .png
    browserSync  = require('browser-sync'),//сервер
    reload       = browserSync.reload; // перезагрузка сервера
    shell        = require('gulp-shell'),
    runSequence  = require('run-sequence'), //запускает задачи по очереди
    clean        = require('gulp-clean');
    




const path = {
    src: {
        html: './src/index.html' ,
        scss: './src/scss/**/style.scss' ,
        css: [
            './src/css/tools/reset.css' ,
            './src/css/vendors/**/*.css' ,
            './src/css/*.css',
        ],
        js: [
            './src/js/vendors/**/*.js',
            './src/js/main.js'
        ],
        img: './src/img/',
        fonts: './src/fonts/**/*'   
    },
    build: {
        html: './build/',
        css: './build/css/',
        js: './build/js/',
        img: './build/img/',
        fonts: './build/fonts/'
    },
    watch: {
        html: './src/*.html' ,
        css: './src/css/**/*.css' ,
        scss: './src/scss/**/*.scss' ,
        js: './src/js/**/*.js' ,
        img: './src/img/**/*',
        fonts: '/src/fonts/**/*'
    },
    clean: './build'
}



gulp.task('html' , function () {
    return gulp.src(path.src.html)
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));

});

gulp.task('js' , function () {
    return gulp.src(path.src.js)
        .pipe(order(['jquery.min.js' , '!script.js']))
        .pipe(uglify())
        .pipe(concat('main.js'))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('scss' , function () {
    return gulp.src(path.src.scss)
        .pipe(concat('style.scss'))
        .pipe(scss())
        .pipe(gulp.dest('./src/css/'))
});

gulp.task('css' , function () {
     return gulp.src(path.src.css)
        .pipe(minifyCss())
        .pipe(concat('main.css'))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('fonts' , function () {
     return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(reload({stream: true}));
});

gulp.task('img', function(){
    return gulp.src(path.src.img + '**/*.*')
        .pipe(cache(imagemin([
                imagemin.gifsicle({interlaced: true}), //сжатие .gif
                imagemin.jpegtran({progressive: true}), //сжатие .jpeg
                imagemin.optipng({optimizationLevel: 5}), //сжатие .png
                imagemin.svgo({                         // сжатие .svg
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ], {
                verbose: true  //отображает инфо о сжатии изображения
            })
        ))
        .pipe(gulp.dest(path.src.img))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('clean', function() {
    return gulp.src(path.build.html)
        .pipe(clean());
});

gulp.task('build', shell.task([
    'gulp clean' ,
    'gulp img' ,
    'gulp html' ,
    'gulp fonts' ,
    'gulp scss',
    'gulp css' ,
    'gulp js' 
]));

gulp.task('watch' , function() {
    gulp.watch(path.watch.html, ['html']);
    gulp.watch(path.watch.css, ['css']);
    gulp.watch(path.watch.scss, 
        function(event, cb) {
        setTimeout(function(){gulp.start('scss');},500)
        });
    gulp.watch(path.watch.img, ['img']);
    gulp.watch(path.watch.js, ['js']);
});

gulp.task('browser-sync' , function() {
    browserSync({
        startPath: '/',
        server: {
            baseDir: 'build'
        },
        notify: false
    })
});

gulp.task('server' , function (){
    runSequence('build' , 'browser-sync' , 'watch')
});

gulp.task('default' , ['build']); // задача по умолчанию 

gulp.task('clear-cache' , function () {
    cache.clearAll();
});