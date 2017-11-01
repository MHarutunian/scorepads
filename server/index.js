/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('./config/webpack.config.dev');
const express = require('express');
const players = require('./api/players');
const db = require('./db');

process.on('uncaughtException', (error) => {
  console.error(error);
});

const compiler = webpack(webpackConfig);
const app = express();

app.get('/scorepads', (req, res) => {
  db.connect();
  res.send('These are insane score pads!');
});

app.get('/api/players', (req, res) => {
  res.send(players.get());
});

app.use('/', express.static('web', {
  index: 'doppelkopf.html'
}));

app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath
}));

app.listen(80);
