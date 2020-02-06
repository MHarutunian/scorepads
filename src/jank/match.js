import Cell from './Cell';
import getParam from '../utils/getParam';
import getPictureSrc from '../utils/getPictureSrc';
import PlayerSelectHelper from '../utils/PlayerSelectHelper';
import sendRequest from '../utils/sendRequest';
import '../css/common.css';
import '../css/jank/match.css';
import '../css/jank/selection.css';

/**
 * The scorepad of the currently active game.
 */
let scorepad;

/**
 * The ID of the player that is active on this connection.
 */
let activePlayerId;

/**
 * The form the player uses to input words.
 */
let wordForm;

/**
 * The form the player uses to input bets.
 */
let betsForm;

/**
 * The WebSocket connection that has been established with the scorepads server.
 */
let socket;

/**
 * The map from player IDs to the corresponding table cells representing them.
 */
const playerCells = {};

/**
 * The list of gifs to choose from when winning a match.
 */
const WIN_GIFS = ['yay.gif', 'goal.gif', 'party.gif'];

/**
 * The list of gifs to choose from when losing a match.
 */
const LOSE_GIFS = ['fck.gif', 'srs.gif'];

/**
 * Handler for the panic button.
 *
 * This will enable the `wordForm`, if it was disabled by accident.
 */
function onPanic() {
  // TODO: This is just a temporary workaround until a proper bugfix is in place
  wordForm.fields.disabled = false;
}

/**
 * Shows a toast-like notification at the top of the page and hides it after 5 seconds.
 *
 * @param {string} text the text to show in the toast
 */
function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.className = 'toast';

  setTimeout(() => {
    toast.className += ' hidden';
  }, 5000);
}

function enterPendingState() {
  Object.keys(playerCells).forEach((playerId) => {
    playerCells[playerId].player.className = 'pending';
  });
}

/**
 * Adds a player to the words table.
 *
 * This will store the respective cells to the `playerCells` object.
 *
 * @param {Object} player the player to add
 */
function addPlayer(player) {
  const table = document.getElementById('match-table');
  const row = table.insertRow();

  const playerCell = row.insertCell();
  const picture = document.createElement('img');
  picture.src = getPictureSrc(player.picture);
  picture.className = 'player-picture';
  playerCell.appendChild(picture);
  playerCell.appendChild(document.createTextNode(player.name));

  const firstWordCell = new Cell(row.insertCell());
  const secondWordCell = new Cell(row.insertCell());
  const termCell = new Cell(row.insertCell());
  const scoreCell = new Cell(row.insertCell(), 0);

  playerCells[player._id] = {
    player: playerCell,
    firstWord: firstWordCell,
    secondWord: secondWordCell,
    term: termCell,
    score: scoreCell
  };
}

/**
 * Shows the score to the active player along with an appropriate reaction gif.
 *
 * @param {number} score the score the player got for the current match
 */
function showScoreAndReaction(score) {
  let gifs;
  let scoreClass;

  if (score > 0) {
    scoreClass = 'score-positive';
    gifs = WIN_GIFS;
  } else if (score < 0) {
    scoreClass = 'score-negative';
    gifs = LOSE_GIFS;
  } else {
    scoreClass = 'score-zero';
    gifs = LOSE_GIFS;
  }

  const gifSrc = gifs[Math.floor(Math.random() * gifs.length)];

  const scoreItem = document.createElement('li');
  scoreItem.className = 'match-text';
  scoreItem.appendChild(document.createTextNode('Deine Punkte diese Runde: '));

  const scoreSpan = document.createElement('span');
  scoreSpan.className = `score ${scoreClass}`;
  scoreSpan.textContent = score;
  scoreItem.appendChild(scoreSpan);
  document.getElementById('bets-list').appendChild(scoreItem);

  const scoreGif = document.createElement('img');
  scoreGif.className = 'score-gif';
  scoreGif.src = `/jank/img/${gifSrc}`;
  document.getElementById('gif-container').appendChild(scoreGif);
}

/**
 * Updates the score of each player using the specifiec score map.
 *
 * @param {Object} scoreMap the map from player IDs to each player's respective score
 */
function updateScores(scoreMap) {
  Object.keys(scoreMap).forEach((playerId) => {
    const { score } = playerCells[playerId];
    score.setValue(score.value + scoreMap[playerId])
  });
}

/**
 * Resets all player cells to placeholder values, except the player name and score.
 *
 * This will also clear the list of bets for the active player.
 */
function resetCells() {
  Object.keys(playerCells).forEach((playerId) => {
    const { firstWord, secondWord, term } = playerCells[playerId];
    firstWord.reset();
    secondWord.reset();
    term.reset();
  });

  const betList = document.getElementById('bets-list');
  while (betList.firstChild) {
    betList.removeChild(betList.firstChild);
  }

  const gifContainer = document.getElementById('gif-container');
  while (gifContainer.firstChild) {
    gifContainer.removeChild(gifContainer.firstChild);
  }
}

/**
 * Adds a word to the cell of the specified player in the specified round.
 *
 * @param {int} round the round index to add the word to
 * @param {string} playerId the ID of the player to add the word for
 * @param {string} word the word to add for the player
 */
function addWord(round, playerId, word) {
  if (playerCells[playerId]) {
    const isFirstRound = round === 0;
    const { firstWord, secondWord } = playerCells[playerId];

    if (playerId === activePlayerId) {
      wordForm.fields.disabled = true;
    } else if (!isFirstRound) {
      const activeSecondWord = playerCells[activePlayerId].secondWord;
      wordForm.fields.disabled = activeSecondWord.value !== null;
    }

    if (isFirstRound) {
      firstWord.setValue(word);
    } else {
      secondWord.setValue(word);
    }
  }
}

/**
 * Adds a bet with the two specified players.
 *
 * @param {Array} param0 the bet to add (i.e. the IDs of the paired players)
 */
function addBet([playerIdA, playerIdB]) {
  const playerA = scorepad.players.find(p => p._id === playerIdA);
  const playerB = scorepad.players.find(p => p._id === playerIdB);

  const betItem = document.createElement('li');
  betItem.className = 'match-text';
  betItem.textContent = `${playerA.name} und ${playerB.name}`;
  document.getElementById('bets-list').appendChild(betItem);
}

/**
 * Handles another player connecting to this game.
 *
 * This will color the corresponding background `green`.
 *
 * @param {string} playerId the ID of the player that connected
 */
function onConnected(playerId) {
  const cell = playerCells[playerId];

  if (cell) {
    cell.player.className = 'ready';
  }
}

/**
 * Handles another player disconnecting from this game.
 *
 * This will color the corresponding background `red`.
 *
 * @param {string} playerId the ID of the player that disconnected
 */
function onDisconnected(playerId) {
  const cell = playerCells[playerId];

  if (cell) {
    cell.player.className = 'disconnected';
  }
}

/**
 * Handles a state change that was pushed from the server.
 *
 * @param {string} state the new state
 */
function onStateChanged(state) {
  const nextButton = document.getElementById('next');

  switch (state) {
    case 'WORDS':
      showToast('Bitte überlege dir jetzt ein Wort, das du teilen möchtest.');
      wordForm.fields.disabled = false;
      nextButton.disabled = true;
      break;
    case 'BETS':
      showToast('Bitte gib unten jetzt einen Tipp ab.');
      enterPendingState();
      betsForm.fields.disabled = false;
      nextButton.disabled = true;
      break;
    case 'PAYOUT':
    default:
      showToast('Du kannst unten nun die Punkte dieser Runde sehen.');
      enterPendingState();
      wordForm.fields.disabled = true;
      betsForm.fields.disabled = true;
      nextButton.disabled = false;
      break;
  }
}

/**
 * Handles a message received through the server's web socket.
 *
 * @param {string} message the message received from the server
 */
function handleMessage(message) {
  const { type, payload } = JSON.parse(message.data);

  switch (type) {
    case 'ready':
    case 'connect':
      onConnected(payload);
      break;
    case 'disconnect':
      onDisconnected(payload);
      break;
    case 'state':
      onStateChanged(payload);
      break;
    case 'term':
      document.getElementById('term-header').textContent = payload;
      playerCells[activePlayerId].term.setValue(payload);
      break;
    case 'word': {
      const { round, playerId, word } = payload;
      addWord(round, playerId, word);
      break;
    }
    case 'bet': {
      const { playerId, bet } = payload;
      if (playerId === activePlayerId) {
        addBet(bet);
      }
      break;
    }
    case 'payout': {
      const { scoreMap, terms } = payload;
      updateScores(scoreMap);
      showScoreAndReaction(scoreMap[activePlayerId]);

      Object.keys(terms).forEach((playerId) => {
        playerCells[playerId].term.setValue(terms[playerId].value);
      });
      break;
    }
    case 'reset':
      resetCells();
      break;
    default:
      console.log(`UNKNOWN MESSAGE TYPE: ${type}`);
      break;
  }
}

/**
 * Connects the player with the specified ID to the server's web socket endpoint.
 */
function connectToSocket() {
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    // there already is a non-closed connected socket
    return;
  }

  const { host } = window.location;
  socket = new WebSocket(`ws://${host}/ws/scorepads/${scorepad._id}?playerId=${activePlayerId}`);

  socket.onopen = () => {
    onConnected(activePlayerId);
  };
  socket.onmessage = handleMessage;
  socket.onclose = () => {
    onDisconnected(activePlayerId);

    // reconnect socket to server
    setTimeout(() => connectToSocket(activePlayerId), 5000);
  };
  socket.onerror = (e) => {
    // TODO error handling
    console.log(`Socket Error: ${e}`); // eslint-disable-line
  };
}

/**
 * Sends a message to the server through the connected socket.
 *
 * @param {string} type the type of the message to send to the server
 * @param {string|Array|Object} [payload=null] the payload to send to the server
 */
function sendMessage(type, payload = null) {
  if (socket) {
    const data = { type };

    if (payload) {
      data.payload = payload;
    }

    socket.send(JSON.stringify(data));
  }
}

/**
 * Initializes the game, including headers, forms and socket communication.
 */
function initGame() {
  scorepad.players.forEach((player) => {
    if (player._id === activePlayerId) {
      const headerText = `Hallo ${player.name}!`;
      document.getElementById('player-header').textContent = headerText;
    }

    addPlayer(player);
  });
  scorepad.matches.forEach(({ score }) => {
    updateScores(score);
  });

  const betsButton = document.getElementById('bets-button');
  const playerSelectHelper = new PlayerSelectHelper(scorepad.players, betsButton);
  playerSelectHelper.addAll(Array.from(betsForm.getElementsByTagName('select')));

  wordForm.onsubmit = (e) => {
    e.preventDefault();

    const word = wordForm.word.value;
    if (word) {
      sendMessage('word', word);
      wordForm.reset();
    }
  };

  betsForm.onsubmit = (e) => {
    e.preventDefault();

    const { first, second, fields } = betsForm;
    const playerA = first.value;
    const playerB = second.value;

    if (playerA && playerB) {
      const bet = [playerA, playerB];
      addBet(bet);
      sendMessage('bet', bet);

      playerSelectHelper.reset();
      fields.disabled = true;
    }
  };

  // after all the game data has been received, connect to the server's web socket
  connectToSocket();
}

/**
 * Resizes the document's body as well as the container holding all of the match's elements.
 */
function resizeContainer() {
  const { documentElement, body } = document;
  const width = window.innerWidth || documentElement.clientWidth || body.clientWidth;
  const scale = width / 768;
  const scalePx = value => `${Math.floor(value * scale)}px`;
  document.body.style = `height: ${scalePx(1024)};`;

  const container = document.getElementById('sheet-container');
  container.style = `padding: ${scalePx(200)} ${scalePx(135)} 0 ${scalePx(130)}`;
}

window.onload = () => {
  activePlayerId = getParam('player');
  const scorepadId = getParam('scorepad');

  document.getElementById('selection-link').href = `/jank/selection.html?scorepad=${scorepadId}`;
  wordForm = document.getElementById('word-form');
  betsForm = document.getElementById('bets-form');

  sendRequest('GET', `/api/scorepads/${scorepadId}`, (result) => {
    scorepad = result;
    initGame();
  });

  document.getElementById('next').onclick = () => sendMessage('new');
  document.getElementById('panic').onclick = onPanic;

  resizeContainer();
  window.onresize = resizeContainer;
};
