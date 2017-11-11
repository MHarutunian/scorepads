/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const config = require('./config/webpack.config.dev');
const express = require('express');
const players = require('./api/players');

const compiler = webpack(config);
const app = express();

app.get('/scorepads', (req, res) => {
  res.send('These are insane score pads!');
});

app.get('/api/players', (req, res) => {
  res.send(players.get());
});

app.use('/', express.static('web', {
  index: 'doppelkopf.html'
}));

app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}));

app.listen(80);
