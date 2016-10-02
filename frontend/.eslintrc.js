module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "extends": "airbnb",
    "rules": {
      'indent': ['error', 4],
      'react/jsx-indent': ['error', 2],
      'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.js'] }],
      'react/jsx-curly-spacing': [2, 'always', { 'spacing': { 'objectLiterals': 'never' }}],
      'react/self-closing-comp': ['error', { 'component': true, 'html': false }],
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-console': 0
    }
}
