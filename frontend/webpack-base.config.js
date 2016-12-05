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

        ]
    },
    eslint: {
        useEslintrc: true
    },
    postcss: function() {
        return [autoprefixer];
    }
};
