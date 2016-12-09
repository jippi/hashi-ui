const merge = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

var webpackConfig = require("./webpack-base.config.js");
webpackConfig = merge(webpackConfig, {
  output: {
    filename: 'static/bundle.js'
  },

  entry: [
    'webpack-dev-server/client?http://localhost:3333',
    'webpack/hot/only-dev-server',
    'babel-polyfill',
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
    new ExtractTextPlugin('bundle.css', { allChunks: true }),
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
        test: /(\.scss)$/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass')
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss')
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: [
          'react-hot',
          'babel?presets[]=es2015&presets[]=es2016&presets[]=react&presets[]=react-optimize&plugins[]=transform-react-inline-elements&plugins[]=syntax-trailing-function-commas&plugins[]=transform-runtime&plugins[]=transform-class-properties&plugins[]=transform-object-rest-spread'
        ]
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
