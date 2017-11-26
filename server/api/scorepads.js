const router = require('express').Router();
const scorepads = require('../db/scorepads');

router.get('/', (req, res) => {
  scorepads.get((result) => {
    res.send(result);
  });
});

router.get('/:id', (req, res) => {
  scorepads.find(req.params.id, (scorepad) => {
    if (scorepad) {
      res.send(scorepad);
    } else {
      res.sendStatus(404);
    }
  });
});


router.post('/', (req, res) => {
  if (!req.body || !req.body.players) {
    res.sendStatus(400);
  } else {
    const { players } = req.body;
    scorepads.add(players, (result) => {
      res.send(result);
    });
  }
});

module.exports = router;
