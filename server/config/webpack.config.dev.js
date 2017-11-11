const webpack = require('webpack');
const config = require('./webpack.config');

const entry = {};
Object.keys(config.entry).forEach((key) => {
  entry[key] = [
    config.entry[key],
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=5000&reload=true'
  ];
});

module.exports = {
  ...config,
  entry,
  devtool: '#source-map',
  output: {
    path: '/',
    publicPath: '/js/',
    filename: '[name].js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};
