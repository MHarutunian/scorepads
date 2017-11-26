/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const webpackConfig = require('./config/webpack.config.dev');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const express = require('express');
const bodyParser = require('body-parser');
const players = require('./api/players');
const scorepads = require('./api/scorepads');

const compiler = webpack(webpackConfig);
const app = express();

// we increase the body limit here to allow bigger images in profile picture uploads
// in the future we probably want to scale the images before uploading them
app.use(bodyParser.json({ limit: '15mb' }));

app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath
}));

app.use(webpackHotMiddleware(compiler));

app.use('/', express.static('web', {
  index: 'doppelkopf.html'
}));

app.use('/api/players', players);
app.use('/api/scorepads', scorepads);

app.listen(80);
