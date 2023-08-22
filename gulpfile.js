const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const watch = require("gulp-watch");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber"); //сантехник - обрабатывает ошибки чтобы сборка не останавливалась
const notify = require("gulp-notify"); //показывает ошибки (всплывающее окно)
const gcmq = require("gulp-group-css-media-queries");
const sassGlob = require("gulp-sass-glob");
const pug = require("gulp-pug"); //подключение pug
const del = require("del");

// ************************************************************************************
// gulp.task("watch", function () {});

//таск для сборки Gulp файлов
gulp.task("pug", function (callback) {
  return gulp
    .src("./src/pug/pages/**/*.pug")
    .pipe(
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "Pug",
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(gulp.dest("./build/"))
    .pipe(browserSync.stream());
  callback();
});

//таск для компиляции SCSS в CSS
gulp.task("scss", function (callback) {
  return gulp
    .src("./src/scss/main.scss")
    .pipe(
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "Styles",
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(
      sass({
        indentType: "tab",
        indentWidth: 1,
        outputStyle: "expanded",
      })
    )
    .pipe(gcmq())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 4 versions"],
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./build/css/"))
    .pipe(browserSync.stream()); //обновление изменений в CSS
  callback();
});
//копирование изображений
gulp.task("copy:img", function (callback) {
  return gulp.src("./src/img/**/*.*").pipe(gulp.dest("./build/img/"));
  callback();
});
//копирование скриптов
gulp.task("copy:js", function (callback) {
  return gulp.src("./src/js/**/*.*").pipe(gulp.dest("./build/js/"));
  callback();
});

// слежение за HTML и обновление брузера
gulp.task("watch", function () {
  //следим за картинками и скрипьтами и обновляем браузер
  watch(
    ["./build/js/**/*.*", "./build/img/**/*.*"],
    gulp.parallel(browserSync.reload)
  );
  //слежение за SCSS и компиляция в CSS с задержкой
  watch("./src/scss/**/*.scss", function () {
    setTimeout(gulp.parallel("scss"), 1000);
  });
  //слежение за PUG и сборка страниц из шаблонов
  watch("./src/pug/**/*.pug", gulp.parallel("pug"));
  //слежение за картинками и скриптами, копирование в build
  watch("./src/img/**/*.*", gulp.parallel("copy:img"));
  watch("./src/js/**/*.*", gulp.parallel("copy:js"));
});

//задача для старта сервера из папки app
gulp.task("server", function () {
  browserSync.init({
    server: {
      baseDir: "./build/",
    },
  });
});

//очищение папаки build
gulp.task("clean:build", function () {
  return del("./build");
});

//дефолтный такс(задача по умолчанию)
//запускаем одновременно задачи  servre and watch
gulp.task(
  "default",
  gulp.series(
    gulp.parallel("clean:build"),
    gulp.parallel("scss", "pug", "copy:img", "copy:js"),
    gulp.parallel("server", "watch")
  )
);
