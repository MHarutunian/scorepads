const express = require('express');

const app = express();
require('express-ws')(app);

const bodyParser = require('body-parser');
const domain = require('domain');
const players = require('./api/players');
const scorepads = require('./api/scorepads');
const terms = require('./api/jank/terms');
const config = require('./config/config');
const scorepadsWs = require('./ws/scorepads');

const appDomain = domain.create();

if (config.dev) {
  /* eslint-disable global-require,import/no-extraneous-dependencies */
  const webpack = require('webpack');
  const webpackConfig = require('./config/webpack.config.dev');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  /* eslint-enable global-require,import/no-extraneous-dependencies */

  const compiler = webpack(webpackConfig);
  const { publicPath } = webpackConfig.output;

  app.use(webpackDevMiddleware(compiler, { publicPath }));
  app.use(webpackHotMiddleware(compiler));
}

// error handler for uncaught exceptions, prevents app from crashing in case of errors
appDomain.on('error', (error) => {
  console.log(error); // eslint-disable-line no-console
});

// we increase the body limit here to allow bigger images in profile picture uploads
// in the future we probably want to scale the images before uploading them
app.use(bodyParser.json({ limit: '15mb' }));

const options = { index: 'index.html' };
app.use('/', express.static('web', options));

app.use('/api/players', players);
app.use('/api/scorepads', scorepads);
app.use('/api/jank/terms', terms);

app.use('/ws/scorepads', scorepadsWs);

app.listen(80);
