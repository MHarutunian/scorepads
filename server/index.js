const express = require('express');
const bodyParser = require('body-parser');
const players = require('./api/players');
const scorepads = require('./api/scorepads');
const config = require('./config/config');
const domain = require('domain');

const app = express();
const appDomain = domain.create();

if (config.dev) {
  /* eslint-disable global-require,import/no-extraneous-dependencies */
  const webpack = require('webpack');
  const webpackConfig = require('./config/webpack.config.dev');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  /* eslint-enable global-require,import/no-extraneous-dependencies */

  const compiler = webpack(webpackConfig);

  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath
  }));

  app.use(webpackHotMiddleware(compiler));
}

// error handler for uncaught exceptions, prevents app from crashing in case of errors
appDomain.on('error', (error) => {
  console.log(error); // eslint-disable-line no-console
});

// we increase the body limit here to allow bigger images in profile picture uploads
// in the future we probably want to scale the images before uploading them
app.use(bodyParser.json({ limit: '15mb' }));


app.use('/', express.static('web', {
  index: 'index.html'
}));

app.use('/api/players', players);
app.use('/api/scorepads', scorepads);

app.listen(80);
