/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const webpackConfig = require('./config/webpack.config.dev');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const express = require('express');
const bodyParser = require('body-parser');
const players = require('./api/players');

process.on('uncaughtException', (error) => {
  // FIXME Should be removed in production, might lead to unstable system
  console.error(error); // eslint-disable-line no-console
});

const compiler = webpack(webpackConfig);
const app = express();

app.use('/', express.static('web', {
  index: 'doppelkopf.html'
}));

app.use(bodyParser.json());

app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath
}));

app.use(webpackHotMiddleware(compiler));

app.get('/scorepads', (req, res) => {
  res.send('These are insane score pads!');
});

app.get('/api/players', (req, res) => {
  players.get((result) => {
    res.send(result);
  });
});

app.post('/api/players', (req, res) => {
  if (!req.body || !req.body.name) {
    res.sendStatus(400);
  } else {
    players.add(req.body.name, (result) => {
      res.send(result);
    });
  }
});

app.listen(80);
