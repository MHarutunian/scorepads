const router = require('express').Router();
const scorepads = require('../db/scorepads');

router.get('/', (req, res) => {
  scorepads.get((result) => {
    res.send(result);
  });
});

router.get('/:id', (req, res) => {
  scorepads.findById(req.params.id, (scorepad) => {
    if (scorepad) {
      res.send(scorepad);
    } else {
      res.sendStatus(404);
    }
  });
});


router.post('/', (req, res) => {
  if (!req.body || !req.body.game || !req.body.players) {
    res.sendStatus(400);
  } else {
    const { game, players } = req.body;
    scorepads.add(game, players, (result) => {
      res.send(result);
    });
  }
});

router.delete('/:id', (req, res) => {
  scorepads.deleteById(req.params.id, (isDeleted) => {
    if (isDeleted) {
      res.send('');
    } else {
      res.sendStatus(404);
    }
  });
});

router.post('/:id/matches', (req, res) => {
  scorepads.addMatch(req.params.id, req.body, (result) => {
    res.send(result);
  });
});

module.exports = router;
