var express = require('express');
var players = require('./api/players');
var app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/scorepads', (req, res) => {
  res.send('These are insane score pads!');
});

app.get('/api/players', (req, res) => {
  res.send(players.join(','));
});

app.use(express.static('web'));

app.listen(80);
