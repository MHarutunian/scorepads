const router = require('express').Router();
const terms = require('../../db/jank/terms');

router.get('/', (req, res) => {
  terms.get((result) => {
    res.send(result);
  });
});

router.post('/', (req, res) => {
  if (!req.body || !req.body.value) {
    res.sendStatus(400);
  } else {
    const { value } = req.body;
    terms.add(value, (result) => {
      res.send(result);
    });
  }
});

router.delete('/:id', (req, res) => {
  terms.deleteById(req.params.id, (isDeleted) => {
    if (isDeleted) {
      res.status(204).send('');
    } else {
      res.sendStatus(404);
    }
  });
});

module.exports = router;
