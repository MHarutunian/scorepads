/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const webpackConfig = require('./config/webpack.config.dev');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const express = require('express');
const players = require('./api/players');

process.on('uncaughtException', (error) => {
  // FIXME Should be removed in production, might lead to unstable system
  console.error(error); // eslint-disable-line no-console
});

const compiler = webpack(webpackConfig);
const app = express();

app.get('/scorepads', (req, res) => {
  res.send('These are insane score pads!');
});

app.get('/api/players', (req, res) => {
  players.get((result) => {
    res.send(result);
  });
});

app.get('/api/players/:name', (req, res) => {
  players.add(req.params.name, (result) => {
    res.send(result);
  });
});

app.use('/', express.static('web', {
  index: 'doppelkopf.html'
}));

app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath
}));

app.use(webpackHotMiddleware(compiler));

app.listen(80);
