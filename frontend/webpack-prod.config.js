const { resolve } = require("path")
const webpack = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const config = {
  devtool: "source-map",

  entry: {
    app: ["babel-polyfill", "./src/main.js"]
  },

  output: {
    filename: "static/[name].[chunkhash].js",
    chunkFilename: "static/[name].[chunkhash].chunks.js",
    sourceMapFilename: "static/[name].[chunkhash].map",
    path: resolve(__dirname, "build/"),
    publicPath: ""
  },

  performance: {
    hints: "warning"
  },

  bail: true,

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "env",
                {
                  modules: false,
                  targets: {
                    browsers: ["last 2 versions"]
                  }
                }
              ],
              "babel-preset-react",
              "babel-preset-react-optimize"
            ],
            plugins: [
              "babel-plugin-transform-runtime",
              "babel-plugin-syntax-trailing-function-commas",
              "babel-plugin-transform-class-properties",
              "babel-plugin-transform-object-rest-spread",
              "babel-plugin-transform-react-constant-elements",
              "syntax-dynamic-import",
              "lodash",
              "recharts"
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
    new webpack.DefinePlugin({ "process.env": { NODE_ENV: JSON.stringify("production") } }),
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
    // specifically bundle recharts on its own
    new webpack.optimize.CommonsChunkPlugin({
      async: "recharts",
      minChunks(module, count) {
        var context = module.context
        var targets = ["recharts"]
        return context && context.indexOf("node_modules") >= 0 && targets.find(t => context.indexOf(t) >= 0)
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      parallel: true,
      sourceMap: true
    }),
    new HtmlWebpackPlugin({
      title: "Hashi-UI",
      inject: false,
      favicon: "./assets/img/favicon.png",
      template: "./index.html.ejs",
      appMountId: "app",
      production: true
    })
  ]
}

module.exports = config
