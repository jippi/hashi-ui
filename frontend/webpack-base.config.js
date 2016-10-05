const path = require('path');
const autoprefixer = require('autoprefixer');

module.exports = {
    output: {
        path: path.join(__dirname, 'build/'),
        publicPath: '/'
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
                loader: "url?limit=100000&name=static/[hash].[ext]&path=/static/"
            },
            {
                test: /\.jpg$/,
                loader: "file?name=static/[hash].[ext]&path=/static/"
            },
            {
                test: /\.(woff|woff2)/,
                loader: 'url?limit=10000&mimetype=application/font-woff&name=static/[hash].[ext]&path=/static/'
            },
            {
                test: /\.ttf/,
                loader: 'url?limit=10000&mimetype=application/octet-stream&name=static/[hash].[ext]&path=/static/'
            },
            {
                test: /\.eot/,
                loader: 'file?name=static/[hash].[ext]&path=/static/'
            },
            {
                test: /\.svg/,
                loader: 'url?limit=10000&mimetype=image/svg+xml&name=static/[hash].[ext]&path=/static/'
            }
        ]
    },
    eslint: {
        useEslintrc: true
    },
    postcss: function() {
        return [autoprefixer];
    }
};
