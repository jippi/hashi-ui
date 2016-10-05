const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

var webpackConfig = require("./webpack-base.config.js");
webpackConfig = merge(webpackConfig, {
    output: {
        filename: 'static/[name].[chunkhash].js',
        chunkFilename: 'static/[name].[chunkhash].chunks.js'
    },
    bail: true,
    entry: [
        './src/main.js'
    ],
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(
                    'style',
                    'css?-autoprefixer!postcss'
                )
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: require('./config/babel.prod')
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract(
                    'style',
                    'css?-autprefixer!postcss!sass?outputStyle=expanded'
                )
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('static/[name].[contenthash].css'),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'}),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                screw_ie8: true,
                warnings: false
            },
            mangle: {
                screw_ie8: true
            },
            output: {
                comments: false,
                screw_ie8: true
            }
        }),
        new HtmlWebpackPlugin({
            title: 'Nomad UI',
            inject: false,
            favicon: './assets/img/favicon.png',
            template: './index.html.ejs',
            appMountId: 'app',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            }
        })
    ]
});

module.exports = webpackConfig;
