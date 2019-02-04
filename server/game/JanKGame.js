const terms = require('../db/jank/terms');

/**
 * The term used for joker players.
 */
const JOKER_TERM = '?JOKER?';

/**
 * Creates a new JanK game that several players can connect to through web sockets.
 *
 * @param {Object} scorepad the scorepad the game is created for
 */
function JanKGame(scorepad) {
  this.scorepad = scorepad;
  this.sockets = {};
  this.termMap = {};
}

/**
 * Adds a connection for the specified player to the game.
 *
 * This will notify all clients about this player's connection.
 *
 * @param {string} playerId the ID of the player that connected
 * @param {WsWrapper} socket the socket wrapper through which the connection was established
 */
JanKGame.prototype.addConnection = function (playerId, socket) {
  socket.onClose(() => {
    delete this.sockets[playerId];

    Object.values(this.sockets).forEach((otherSocket) => {
      otherSocket.disconnect(playerId);
    });
  });

  Object.keys(this.sockets).forEach((otherPlayerId) => {
    this.sockets[otherPlayerId].connect(playerId);
    socket.connect(otherPlayerId);
  });

  socket.onMessage((message) => {
    if (message.word) {
      Object.values(this.sockets).forEach((otherSocket) => {
        otherSocket.send('word', { playerId, word: message.word });
      });
    }
  });

  this.sockets[playerId] = socket;

  if (playerId in this.termMap) {
    socket.send('term', this.termMap[playerId].value);
  } else {
    this.initTerms();
  }
};

/**
 * Initializes the terms for each player and sends the terms to already connected players.
 *
 * Other players will have their terms sent to them upon connection (i.e. in `addConnection()`).
 */
JanKGame.prototype.initTerms = function () {
  if (this.isInitialized) {
    return;
  }

  this.isInitialized = true;

  terms.getForScorepad(this.scorepad, (nextTerms) => {
    let { players } = this.scorepad;
    const getRandomPlayer = () => {
      const index = Math.floor(Math.random() * Math.floor(players.length));
      const player = players[index];
      players = players.filter(p => p !== player);
      return player;
    };
    const addTerm = (player, term) => {
      const playerId = player._id.valueOf();
      this.termMap[playerId] = term;

      if (playerId in this.sockets) {
        this.sockets[playerId].send('term', term.value);
      }
    };
    nextTerms.forEach((term) => {
      addTerm(getRandomPlayer(), term);
      addTerm(getRandomPlayer(), term);
    });

    // these players didn't get a term -> they are jokers
    players.forEach(p => addTerm(p, { value: JOKER_TERM }));
  });
};

/**
 * Checks whether the game is still active, i.e. if any of the players is still connected.
 */
JanKGame.prototype.isActive = function () {
  return Object.values(this.sockets).some(socket => socket.isConnected());
};

module.exports = JanKGame;
