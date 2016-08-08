const path = require('path');
const merge = require('webpack-merge')
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

var settings = require('./config/settings.dev.json')

var webpackConfig = {
    output: {
        path: path.join(__dirname, 'dist/'),
        publicPath: '/',
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.css', '.scss']
    },
    module: {
        preLoaders: [
          {
            test: /\.js$/,
            loader: 'eslint'
          }
        ],
        loaders: [
            {
                test: /\.png$/,
                loader: "url?limit=100000"
            },
            {
                test: /\.jpg$/,
                loader: "file"
            },
            {
                test: /\.(woff|woff2)/,
                loader: 'url?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.ttf/,
                loader: 'url?limit=10000&mimetype=application/octet-stream'
            },
            {
                test: /\.eot/,
                loader: 'file'
            },
            {
                test: /\.svg/,
                loader: 'url?limit=10000&mimetype=image/svg+xml'
            }
        ]
    },
    eslint: {
        configFile: path.join(__dirname, '/config/eslint.js'),
        useEslintrc: false
    },
    postcss: function() {
        return [autoprefixer];
    }
}

if (process.env.NODE_ENV === 'production') {
    settings = require('./config/settings.prod.json')
    webpackConfig = merge(webpackConfig, {
        externals: {
            'settings': JSON.stringify(settings)
        },
        output: {
            filename: '[name].[chunkhash].js',
            chunkFilename: '[name].[chunkhash].chunks.js'
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
            new ExtractTextPlugin('[name].[contenthash].css'),
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.DedupePlugin(),
            new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"' }),
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
        ],
    })
} else {
    webpackConfig = merge(webpackConfig, {
        externals: {
            'settings': JSON.stringify(settings)
        },
        output: {
            filename: 'bundle.js'
        },
        entry: [
            'webpack-dev-server/client?http://localhost:3333',
            'webpack/hot/only-dev-server',
            './src/main.js'
        ],
        devtool: 'cheap-module-eval-source-map',
        plugins: [
            new HtmlWebpackPlugin({
                title: 'Nomad UI',
                inject: false,
                template: './index.html.ejs',
                favicon: './assets/img/favicon.png',
                appMountId: 'app'
            }),
            new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' }),
            new webpack.HotModuleReplacementPlugin()
        ],
        devServer: {
            port: 3333,
            hot: true,
            historyApiFallback: true,
            publicPath: webpackConfig.output.publicPath
        },
        module: {
            loaders: [
                {
                    test: /\.css$/,
                    loader: 'style!css!postcss'
                },
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    loaders: [
                        'react-hot',
                        'babel?presets[]=es2015,presets[]=es2016,presets[]=react,plugins[]=syntax-trailing-function-commas,plugins[]=transform-runtime,plugins[]=transform-class-properties,plugins[]=transform-object-rest-spread'
                    ]
                },
                {
                    test: /\.scss$/,
                    loader: 'style!css?-autprefixer!postcss!sass'
                }
            ]
        },
    })
}

module.exports = webpackConfig;
