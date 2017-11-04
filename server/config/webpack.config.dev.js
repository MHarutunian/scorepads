const config = require('./webpack.config');

module.exports = {
  ...config,
  devtool: '#source-map',
  output: {
    path: '/',
    publicPath: '/js/',
    filename: '[name].js'
  }
};
