/**
 * /*
 * 	Import Plugins
 *
 * @format
 */

const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const sourceMaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const cssDeclSort = require("css-declaration-sorter");
const mqPacker = require("css-mqpacker");
const stylelint = require("stylelint");

const pug = require("gulp-pug");

const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const browserSync = require("browser-sync").create();
const babel = require("gulp-babel");
const changed = require("gulp-changed");

const imagemin = require("gulp-imagemin");
const imageminJpg = require("imagemin-jpeg-recompress");
const imageminPng = require("imagemin-pngquant");

const ejs = require("gulp-ejs");

const rename = require("gulp-rename");
const data = require("gulp-data");
const fs = require("fs");

const typescript = require("gulp-typescript");

const htmlBeautify = require("gulp-html-beautify");

/*
	Define Tasks
*/

// pagesのpugファイルをコンパイルしてdistに挿入
const taskPug = () => {
  return gulp
    .src(["./pug/pages/**/*.pug"])
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(
      pug({
        pretty: true,
        basedir: "./pug",
      })
    )
    .pipe(gulp.dest("../dist/"));
};

// index.htmlのコピー
const copyHtml = () => {
  return gulp
    .src(["./index.html"])
    .pipe(
      htmlBeautify({
        indent_size: 2,
        indent_char: " ",
        max_preserve_newlines: 0,
        preserve_newlines: false,
        extra_liners: [],
      })
    )
    .pipe(gulp.dest("../dist"));
};

// ejsのコンパイル
const taskEjs = () => {
  const json = JSON.parse(fs.readFileSync("./json/data.json", "utf-8"));
  return gulp
    .src(["ejs/**/*.ejs", "!" + "ejs/**/_*.ejs"])
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(
      data((file) => {
        return {
          filename: file.path,
        };
      })
    )
    .pipe(ejs({ json: json }, {}, { ext: ".html" }))
    .pipe(rename({ extname: ".html" }))
    .pipe(gulp.dest("../dist"));
};

// Sassのコンパイル
const taskSass = () => {
  const plugin = [mqPacker(), cssDeclSort({ order: "smacss" }), stylelint()];

  return gulp
    .src(["./assets/scss/**/*.scss", "!" + "./assets/scss/**/_*.scss"])
    .pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
    .pipe(sourceMaps.init())
    .pipe(
      sass({
        outputStyle: "compressed",
      })
    )
    .pipe(postcss(plugin))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 2 versions", "ie >= 11", "Android >= 4"],
        cascade: false,
      })
    )
    .on("error", sass.logError)
    .pipe(sourceMaps.write())
    .pipe(gulp.dest("../dist/assets/css"));
};

// JavaScriptのトランスパイル
const taskBabel = () => {
  return gulp
    .src("./assets/js/**/*.js")
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(gulp.dest("../dist/assets/js"));
};

const taskTypeScript = () => {
  return gulp.src("./assets/ts/common.ts").pipe(typescript()).js.pipe(gulp.dest("../dist/assets/js"));
};

// 画像の圧縮(jpg, png)
const taskImage = () => {
  const srcGlob = "./assets/img/*.+(jpg|jpeg|png|svg)";
  const dstGlob = "../dist/assets/img";
  return gulp
    .src(srcGlob)
    .pipe(changed(dstGlob))
    .pipe(imagemin([imageminPng(), imagemin.svgo()]))
    .pipe(gulp.dest(dstGlob));
};

// ブラウザのリロード
const taskReload = (done) => {
  browserSync.reload();
  done();
};

/*
	ファイルの監視
*/
const taskWatchPug = () => {
  gulp.watch(["./pug/**/*.pug"], gulp.series(taskPug, taskReload));
};

const taskWatchEjs = () => {
  gulp.watch(["./ejs/**/*.ejs", "./json/**/*.json"], gulp.series(taskEjs, taskReload));
};

const taskWatchSass = () => {
  gulp.watch(["./assets/scss/**/*.scss"], gulp.series(taskSass, taskReload));
};

const taskWatchBabel = () => {
  gulp.watch(["./assets/js/**/*.js"], gulp.series(taskBabel, taskReload));
};

const taskWatchTypeScript = () => {
  gulp.watch(["./assets/ts/**/*.ts"], gulp.series(taskTypeScript, taskReload));
};

const taskWatchImage = () => {
  gulp.watch(["./assets/img/**/*.+(jpg|jpeg|png)"], gulp.series(taskImage, taskReload));
};

const taskWatchIndex = () => {
  gulp.watch(["./index.html"], gulp.series(copyHtml, taskReload));
};

// サーバの起動
const taskServerStart = () => {
  browserSync.init({
    server: {
      baseDir: "../dist/",
    },
    port: 8989,
    notify: false,
  });
};

//gulp.task('default', gulp.task('bundle'));
// 監視タスクをまとめる
exports.watch = gulp.parallel(taskServerStart, taskWatchSass, taskWatchPug, taskWatchImage, taskWatchBabel);

// defaultのタスク定義
// exports.default = gulp.series(gulp.parallel(taskPug, taskSass, taskBabel, taskImage));
exports.default = gulp.parallel(
  taskServerStart,
  taskWatchSass,
  // taskWatchPug,
  // taskWatchEjs,
  taskWatchImage,
  taskWatchIndex,
  taskWatchTypeScript
  // taskWatchBabel
);

// 画像の圧縮単体タスク
exports.taskImage = gulp.series(taskImage);
