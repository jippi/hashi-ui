const { resolve } = require("path")
const webpack = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin")

const config = {
  devtool: "source-map",

  entry: {
    app: ["babel-polyfill", "./src/main.js"],
    recharts: ["recharts"],
    vendor: [
      "core-js",
      "date-fns",
      "deepmerge",
      "fixed-data-table-2",
      "lodash",
      "material-ui",
      "react-ace",
      "react-append-to-body",
      "react-flexbox-grid",
      "react-helmet",
      "react-tooltip"
    ]
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
    new webpack.DefinePlugin({ "process.env": { NODE_ENV: JSON.stringify("production") } }),
    new webpack.optimize.CommonsChunkPlugin({ names: ["recharts", "vendor", "app"], minChunks: 2 }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      beautify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true
      },
      compress: {
        screw_ie8: true
      },
      comments: false
    }),
    new HtmlWebpackPlugin({
      title: "Hashi-UI",
      inject: false,
      favicon: "./assets/img/favicon.png",
      template: "./index.html.ejs",
      appMountId: "app",
      production: true,
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
}

module.exports = config
