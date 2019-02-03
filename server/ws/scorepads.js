const router = require('express').Router();
const WsWrapper = require('./WsWrapper');
const scorepads = require('../db/scorepads');
const JanKGame = require('../game/JanKGame');

/**
 * Dictionary of games that are currently active.
 */
const games = {};

router.ws('/:scorepadId', (ws, req) => {
  const { scorepadId } = req.params;
  const { playerId } = req.query;
  const wsWrapper = new WsWrapper(ws);
  scorepads.findById(scorepadId, (scorepad) => {
    if (scorepad) {
      const player = scorepad.players.find(p => p._id.equals(playerId));

      if (player) {
        const game = games[scorepadId] || new JanKGame(scorepad);
        game.addConnection(playerId, wsWrapper);
        games[scorepadId] = game;
      } else {
        wsWrapper.error(`Player ${playerId} does not belong to scorepad.`);
      }
    } else {
      wsWrapper.error(`Scorepad ${scorepadId} does not exist.`);
    }
  });
});

// check for inactive games every minute and remove them
setInterval(() => {
  Object.keys(games).forEach((key) => {
    if (!games[key].isActive()) {
      delete games[key];
    }
  });
}, 60000);

module.exports = router;
