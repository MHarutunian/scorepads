const router = require('express').Router();
const players = require('../db/players');

router.get('/', (req, res) => {
  players.get((result) => {
    res.send(result);
  });
});

router.post('/', (req, res) => {
  if (!req.body || !req.body.name) {
    res.sendStatus(400);
  } else {
    players.add(req.body.name, (result) => {
      res.send(result);
    });
  }
});

router.put('/', (req, res) => {
  if (!req.body || !req.body._id || !req.body.name) {
    res.sendStatus(400);
  } else {
    players.update(req.body._id, req.body.name, (isSuccess) => {
      if (isSuccess) {
        res.send(req.body);
      } else {
        res.sendStatus(400);
      }
    });
  }
});

module.exports = router;
