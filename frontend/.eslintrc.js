module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  extends: ['eslint:recommended', 'standard-react'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      experimentalObjectRestSpread: true,
    }
  },
  "rules": {
    'indent': ['error', 2],
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-console': 0,
    'no-plusplus': 0,
    'operator-linebreak': 0,
    'class-methods-use-this': 0,
    'arrow-body-style': 0,
    'max-len': ['error', 120],
    'react/jsx-indent': ['error', 2],
    'react/prefer-stateless-function': 0,
    'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.js'] }],
    'react/jsx-curly-spacing': [2, 'always', { 'spacing': { 'objectLiterals': 'never' }}],
    'react/self-closing-comp': ['error', { 'component': true, 'html': false }],
    'react/forbid-prop-types': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-has-content': 0,
  }
}
