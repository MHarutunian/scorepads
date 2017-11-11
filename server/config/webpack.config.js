const path = require('path');

module.exports = {
  entry: {
    doppelkopf: './src/doppelkopf.js',
    doppelkopfSchreiben: './src/doppelkopfSchreiben.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../../web/js')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  }
};
