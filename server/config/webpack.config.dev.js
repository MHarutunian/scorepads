const webpack = require('webpack');
const config = require('./webpack.config');

const entry = {};
Object.keys(config.entry).forEach((key) => {
  entry[key] = [
    'event-source-polyfill',
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=5000&reload=true',
    config.entry[key]
  ];
});

module.exports = {
  ...config,
  entry,
  devtool: '#source-map',
  mode: 'development',
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
