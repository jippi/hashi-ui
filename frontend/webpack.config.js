const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

var webpackConfig = require("./webpack-base.config.js");
webpackConfig = merge(webpackConfig, {
    output: {
        filename: 'static/bundle.js'
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
        new webpack.DefinePlugin({ 'process.env.GO_PORT': process.env.GO_PORT || 3000 }),
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
    externals: {
      'react/addons': true,
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': true
    }
});

module.exports = webpackConfig;
