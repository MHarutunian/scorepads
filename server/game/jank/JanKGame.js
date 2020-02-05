const scorepads = require('../../db/scorepads');
const dbTerms = require('../../db/jank/terms');
const { JOKER_TERM } = require('./constants');

/**
 * Creates a new JanK game that several players can connect to through web sockets.
 *
 * @param {Object} scorepad the scorepad the game is created for
 */
function JanKGame(scorepad) {
  this.scorepad = scorepad;
  this.sockets = {};
  this.currentMatch = null;
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

    Object.values(this.sockets).forEach(s => s.disconnect(playerId));
  });

  Object.keys(this.sockets).forEach((id) => {
    this.sockets[id].connect(playerId);
    socket.connect(id);
  });

  this.sockets[playerId] = socket;
  this.addMessageHandler(playerId);
  this.sendInitialState(playerId);
};

/**
 * Initializes a new match along with terms for each player, and afterwards broadcasts the state.
 *
 * The terms for each player are sent to already connected players.
 * Other players will have their terms sent to them upon connection (i.e. in `addConnection()`).
 */
JanKGame.prototype.initNewMatch = function () {
  if (this.currentMatch) {
    return;
  }

  this.currentMatch = {
    state: 'LOADING',
    round: 0,
    terms: {},
    rounds: [
      {
        words: {},
        bets: {}
      },
      {
        words: {},
        bets: {}
      }
    ],
    playersReady: []
  };

  dbTerms.getForScorepad(this.scorepad, (terms) => {
    let { players } = this.scorepad;
    const getRandomPlayer = () => {
      const index = Math.floor(Math.random() * Math.floor(players.length));
      const player = players[index];
      players = players.filter(p => p !== player);
      return player;
    };
    const addTerm = (player, term) => {
      const playerId = player._id.valueOf();
      this.currentMatch.terms[playerId] = term;

      if (playerId in this.sockets) {
        this.sockets[playerId].send('term', term.value);
      }
    };
    terms.forEach((term) => {
      addTerm(getRandomPlayer(), term);
      addTerm(getRandomPlayer(), term);
    });

    // these players didn't get a term -> they are jokers
    players.forEach(p => addTerm(p, { value: JOKER_TERM }));

    this.currentMatch.state = 'WORDS';
    this.broadcastState();
  });
};

/**
 * Adds a message handler for the specified player ID.
 *
 * The message handler handles incoming messages, updating the current match's words and bets.
 *
 * @param {string} playerId the ID of the player to add the message handler for
 */
JanKGame.prototype.addMessageHandler = function (playerId) {
  const socket = this.sockets[playerId];
  socket.onMessage(({ type, payload }) => {
    if (!this.currentMatch) {
      return;
    }

    const { rounds, round } = this.currentMatch;
    const currentRound = rounds[round];

    if (type === 'word') {
      // broadcast word to other players
      Object.values(this.sockets).forEach((s) => {
        s.send('word', { playerId, round, word: payload });
      });

      currentRound.words[playerId] = payload;
      if (Object.keys(currentRound.words).length === this.scorepad.players.length) {
        this.currentMatch.state = 'BETS';
        this.broadcastState();
      }
    } else if (type === 'bet') {
      currentRound.bets[playerId] = payload;
      // do not broadcast bets yet - they are private to each player until the end of the match

      if (Object.keys(currentRound.bets).length === this.scorepad.players.length) {
        if (round === 0) {
          this.currentMatch = {
            ...this.currentMatch,
            round: 1,
            state: 'WORDS'
          };
        } else if (this.currentMatch !== 'PAYOUT') {
          this.currentMatch.state = 'PAYOUT';
          scorepads.addMatch(this.scorepad._id, this.currentMatch, (match) => {
            this.currentMatch = {
              ...this.currentMatch,
              ...match
            };
            this.scorepad.matches.push(this.currentMatch);
            this.broadcastPayout();
          });
        }

        this.broadcastState();
      }
    } else if (type === 'new') {
      if (!this.currentMatch.playersReady.includes(playerId)) {
        this.currentMatch.playersReady.push(playerId);
      }

      Object.values(this.sockets).forEach(s => s.send('ready', playerId));

      if (this.scorepad.players.length === this.currentMatch.playersReady.length) {
        Object.values(this.sockets).forEach(s => s.send('reset'));
        this.currentMatch = null;
        this.initNewMatch();
      }
    }
  });
};

/**
 * Sends the initial state for the specified player ID.
 *
 * The initial state contains the match's current state, all words that have been provided
 * by each of the players and all of the bets the player has made (no bets of other players).
 *
 * @param {string} id the ID of the player to send the initial state to
 */
JanKGame.prototype.sendInitialState = function (id) {
  if (!this.currentMatch) {
    this.initNewMatch();
    // we wait for the match to be initialized, the initial state will be sent automatically
    // once the game is initialized, so we don't need to do anything else here
    return;
  }

  const socket = this.sockets[id];
  this.sendState(socket);

  const { state, terms, rounds, playersReady } = this.currentMatch;

  if (state === 'PAYOUT') {
    this.sendPayout(socket);
  } else if (id in terms) {
    socket.send('term', terms[id].value);
  }

  rounds.forEach(({ words, bets }, index) => {
    Object.keys(words).forEach((playerId) => {
      socket.send('word', { playerId, round: index, word: words[playerId] });
    });

    if (id in bets) {
      socket.send('bet', { playerId: id, bet: bets[id] });
    }
  });

  playersReady.forEach(playerId => {
    socket.send('ready', playerId);
  });
};

/**
 * Broadcasts the current match's state to all connected players.
 */
JanKGame.prototype.broadcastState = function () {
  Object.values(this.sockets).forEach(socket => this.sendState(socket));
};

/**
 * Sends the current state to the provided socket.
 *
 * @param {WsWrapper} socket the socket to send the state to
 */
JanKGame.prototype.sendState = function (socket) {
  socket.send('state', this.currentMatch.state);
};

/**
 * Broadcasts the payout of the current match to all connected players.
 */
JanKGame.prototype.broadcastPayout = function () {
  Object.values(this.sockets).forEach(socket => this.sendPayout(socket));
};

/**
 * Sends the payout of the current match to the specified socket.
 *
 * @param {WsWrapper} socket the socket to send the payout to
 */
JanKGame.prototype.sendPayout = function (socket) {
  const { terms, score } = this.currentMatch;
  socket.send('payout', { terms, scoreMap: score });
};

/**
 * Checks whether the game is still active, i.e. if any of the players is still connected.
 */
JanKGame.prototype.isActive = function () {
  return Object.values(this.sockets).some(socket => socket.isConnected());
};

module.exports = JanKGame;
