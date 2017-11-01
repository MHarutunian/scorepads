module.exports = {
  entry: {
    doppelkopf: './src/doppelkopf.js'
  },
  devtool: '#source-map',
  output: {
    path: '/',
    publicPath: '/js/',
    filename: '[name].js'
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
