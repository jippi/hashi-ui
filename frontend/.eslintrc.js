module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "extends": "airbnb",
    "rules": {
      'indent': ['error', 4],
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-console': 0,
      'max-len': ['error', 120],
      'react/jsx-indent': ['error', 2],
      'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.js'] }],
      'react/jsx-curly-spacing': [2, 'always', { 'spacing': { 'objectLiterals': 'never' }}],
      'react/self-closing-comp': ['error', { 'component': true, 'html': false }],
      'react/forbid-prop-types': 0,
      'jsx-a11y/no-static-element-interactions': 0,
    }
}
