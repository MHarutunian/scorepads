var express = require('express');
var players = require('./api/players');
var app = express();

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
