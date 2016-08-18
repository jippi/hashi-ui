const path = require('path');
const autoprefixer = require('autoprefixer');

module.exports = {
    output: {
        path: path.join(__dirname, 'dist/'),
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
};
