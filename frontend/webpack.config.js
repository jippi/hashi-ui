const { resolve } = require("path")

const webpack = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin")

const config = {
  devtool: "inline-source-map",

  entry: {
    app: [
      "babel-polyfill",
      "react-hot-loader/patch",
      "webpack-dev-server/client?http://localhost:3333",
      "webpack/hot/only-dev-server",
      "./src/main.js"
    ]
  },

  output: {
    filename: "static/[name].[hash].js",
    chunkFilename: "static/[name].[hash].chunks.js",
    sourceMapFilename: "static/[name].[hash].map",
    path: resolve(__dirname, "dist"),
    publicPath: "/"
  },

  devServer: {
    port: 3333,
    hot: true,
    historyApiFallback: true,
    publicPath: "/"
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            presets: [
              "es2015",
              [
                "env",
                {
                  modules: false,
                  targets: {
                    browsers: ["last 2 versions"]
                  }
                }
              ],
              "babel-preset-react"
            ],
            plugins: [
              "babel-plugin-syntax-trailing-function-commas",
              "babel-plugin-transform-class-properties",
              "babel-plugin-transform-object-rest-spread",
              "babel-plugin-transform-react-constant-elements",
              "syntax-dynamic-import",
              "transform-runtime",
              "lodash"
            ]
          }
        }
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: "style-loader" // creates style nodes from JS strings
          },
          {
            loader: "css-loader" // translates CSS into CommonJS
          },
          {
            loader: "sass-loader" // compiles Sass to CSS
          }
        ]
      },
      { test: /\.(png|jpg)$/, use: "url-loader?limit=15000" },
      { test: /\.eot(\?v=\d+.\d+.\d+)?$/, use: "file-loader" },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: "url-loader?limit=10000&mimetype=application/font-woff" },
      { test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/, use: "url-loader?limit=10000&mimetype=application/octet-stream" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: "url-loader?limit=10000&mimetype=image/svg+xml" }
    ]
  },

  plugins: [
    new LodashModuleReplacementPlugin(),
    new webpack.DefinePlugin({ "process.env.NODE_ENV": '"development"' }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://medium.com/@adamrackis/vendor-and-code-splitting-in-webpack-2-6376358f1923
    // generic vendor bundle
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks(module, count) {
        var context = module.context
        return context && context.indexOf("node_modules") >= 0
      }
    }),
    // webpack manifest file
    new webpack.optimize.CommonsChunkPlugin({ name: "manifest" }),
    // catch all - anything used in more than one place
    new webpack.optimize.CommonsChunkPlugin({
      async: "common",
      minChunks(module, count) {
        return count >= 2
      }
    }),
    new webpack.LoaderOptionsPlugin({
      test: /\.js$/,
      options: {
        eslint: {
          configFile: resolve(__dirname, ".eslintrc"),
          cache: false
        }
      }
    }),
    new ExtractTextPlugin({ filename: "assets/data-table.css", disable: false, allChunks: true }),
    new ExtractTextPlugin({ filename: "assets/hashi-ui.css", disable: false, allChunks: true }),
    new HtmlWebpackPlugin({
      title: "Hashi UI",
      inject: false,
      template: "./index.html.ejs",
      favicon: "./assets/img/favicon.png",
      appMountId: "app",
      window: {
        HASHI_ENDPOINT: "http://127.0.0.1:3000",
        HASHI_ENDPOINT_PORT: 3000,
        HASHI_ASSETS_ROOT: "http://127.0.0.1:3333",
        HASHI_DEV: true
      }
    })
  ]
}

module.exports = config
