/*!
 * @author dawangraoming<admin@yeenuo.net>
 * @website http://www.yeenuo.net
 * @date 2019-03-11
 */
const {resolve} = require('path');
const copyWebpackPlugin = require('copy-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

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
 * 端口号
 * @type {number}
 */
const WATCH_PORT = 8765;

module.exports = {
    mode: env,
    watch: IS_DEVELOPMENT,
    devServer: {
        port: WATCH_PORT
    },
    entry: {
        'background': './src/background/index.ts',
        'popup': './src/popup/index.ts',
        'context-script': './src/context-script/index.ts',
    },
    output: {
        publicPath: '.',
        path: resolve(__dirname, 'dist'),
        filename: "[name].js",
    },
    module: {
        rules: [
            {test: /\.ts$/, loader: 'ts-loader'},
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {
                test: /\.s[ac]ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                require('autoprefixer'),
                            ]
                        }
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            },
        ]
    },
    plugins: [
        new ChromeExtensionReloader({
            port: WATCH_PORT,
            reloadPage: true,
            entries: {
                contentScript: 'context-script',
                background: 'background'
            }
        }),
        new copyWebpackPlugin([
            {from: './src/icon.png'}
        ]),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
    ]
};
