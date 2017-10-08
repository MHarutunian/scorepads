const express = require('express');
const players = require('./api/players');

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

app.listen(80);
