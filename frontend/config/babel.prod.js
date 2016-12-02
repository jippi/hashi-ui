module.exports = {
  presets: [
    'babel-preset-es2015',
    'babel-preset-es2016',
    'babel-preset-react',
    'react-optimize'
  ].map(require.resolve),
  plugins: [
    'babel-plugin-transform-runtime',
    'babel-plugin-syntax-trailing-function-commas',
    'babel-plugin-transform-class-properties',
    'babel-plugin-transform-object-rest-spread',
    'babel-plugin-transform-react-constant-elements'
  ].map(require.resolve)
};
