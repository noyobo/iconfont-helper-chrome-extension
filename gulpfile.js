/*!
 * @author dawangraoming<admin@yeenuo.net>
 * @website http://www.yeenuo.net
 * @date 2019-03-12
 */

const {basename} = require('path');
const gulp = require('gulp');
const webpack = require('webpack');
const Stream = require('stream');
const {version} = require('./package.json');
const webpackConfig = require('./webpack.config');
const clean = require('gulp-clean');


/**
 * 环境变量
 * @type {string}
 */
const env = process.env.NODE_ENV;
/**
 * 判断是否开发环境
 * @type {boolean}
 */
const IS_DEVELOPMENT = env === "development";


/**
 * 清理输出目录
 */
function cleanDist() {
    return gulp.src('./dist', {read: false}).pipe(clean());
}

/**
 * 转换stream内容
 * @param transform {function}
 * @returns {Stream.Transform}
 */
function transformFromStream(transform) {
    const stream = new Stream.Transform({objectMode: true});
    stream._transform = function (file, encoding, callback) {
        const contents = file.contents.toString();
        // 获取文件名
        const fileName = basename(file.history[file.history.length - 1]);
        file.contents = new Buffer(transform({
            contents,
            fileName,
        }));
        callback(null, file);
    };
    return stream;
}

/**
 * 更新popup.html和manifest.json的版本号
 * @returns {*|worker}
 */
function generateVersion() {
    return gulp.src(['./src/popup/popup.html', './manifest.json'])
        .pipe(transformFromStream(({contents, fileName}) => {
            // 如果是manifest文件，在开发模式下，就去除安全限制
            // 因为webpack开发模式下使用eval更新JS，插件默认会被禁用eval执行
            if (IS_DEVELOPMENT && fileName === 'manifest.json') {
                const json = JSON.parse(contents);
                json['content_security_policy'] = `script-src 'self' 'unsafe-eval'; object-src 'self'`;
                contents = JSON.stringify(json);
            }
            // 自动填充版本号
            return contents.replace(/\$VERSION\$/, version);
        })).pipe(gulp.dest('./dist'));
}

function webpackWatch() {
    webpack(webpackConfig).watch(200, function (err, stats) {
    });
}

function webpackBuild(done) {
    webpack(webpackConfig, function () {
        done();
    });
}

const watch = gulp.series(cleanDist, gulp.parallel(generateVersion, webpackWatch));
const build = gulp.series(cleanDist, gulp.parallel(generateVersion, webpackBuild));

exports.watch = watch;
exports.build = build;
exports.default = build;
