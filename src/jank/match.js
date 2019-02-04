import sendRequest from '../utils/sendRequest';
import getParam from '../utils/getParam';
import getPictureSrc from '../utils/getPictureSrc';
import '../css/common.css';
import '../css/jank/match.css';
import '../css/jank/selection.css';

/**
 * The ID of the currently loaded scorepad.
 */
let scorepadId;

/**
 * The ID of the player that is active on this connection.
 */
let activePlayerId;

/**
 * The form the player uses to input words.
 */
let wordForm;

/**
 * The WebSocket connection that has been established with the scorepads server.
 */
let socket;

/**
 * The map from player IDs to the corresponding table cells representing them.
 */
const playerCells = {};

/**
 * The placeholder to use until a term/partner has been entered in the respective cell.
 */
const PLACEHOLDER = '???';

/**
 * Adds a player to the words table.
 *
 * This will store the respective cells to the `playerCells` object.
 *
 * @param {Object} player the player to add
 */
function addPlayer(player) {
  const table = document.getElementById('word-table');
  const row = table.insertRow();

  const playerCell = row.insertCell();
  const picture = document.createElement('img');
  picture.src = getPictureSrc(player.picture);
  picture.className = 'player-picture';
  playerCell.appendChild(picture);
  playerCell.appendChild(document.createTextNode(player.name));

  const createPlaceholder = () => {
    const cell = row.insertCell();
    cell.textContent = PLACEHOLDER;

    return cell;
  };

  playerCells[player._id] = {
    player: playerCell,
    firstWord: createPlaceholder(),
    secondWord: createPlaceholder(),
    partner: createPlaceholder()
  };
}

/**
 * Checks whether a player has already provided his first word.
 *
 * @param {string} playerId the ID of the player in question
 * @returns {boolean} has the player already provided his first word?
 */
function hasFirstWord(playerId) {
  return playerCells[playerId].firstWord.textContent !== PLACEHOLDER;
}

/**
 * Adds a word to the corresponding cell of the specified player.
 *
 * @param {string} playerId the ID of the player to add the word for
 * @param {string} word the word to add for the player
 */
function addWord(playerId, word) {
  const { fields } = wordForm;

  if (playerCells[playerId]) {
    const { firstWord, secondWord } = playerCells[playerId];

    if (firstWord.textContent === PLACEHOLDER) {
      firstWord.textContent = word;
    } else {
      secondWord.textContent = word;
    }
  }

  // TODO disable fields on second word

  const playerIds = Object.keys(playerCells);

  if (playerId === activePlayerId) {
    fields.disabled = playerIds.some(id => !hasFirstWord(id));
  } else if (playerIds.every(hasFirstWord)) {
    fields.disabled = false;
  }
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
    cell.player.style.background = 'green';
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
    cell.player.style.background = 'red';
  }
}

/**
 * Handles a message received through the server's web socket.
 *
 * @param {string} message the message received from the server
 */
function handleMessage(message) {
  const { type, payload } = JSON.parse(message.data);

  if (type === 'connect') {
    onConnected(payload);
  } else if (type === 'disconnect') {
    onDisconnected(payload);
  } else if (type === 'word') {
    const { playerId, word } = payload;
    addWord(playerId, word);
  } else if (type === 'term') {
    document.getElementById('term-header').textContent = payload;
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
  socket = new WebSocket(`ws://${host}/ws/scorepads/${scorepadId}?playerId=${activePlayerId}`);

  socket.onopen = () => {
    onConnected(activePlayerId);
    wordForm.fields.disabled = false;
  };
  socket.onmessage = handleMessage;
  socket.onclose = () => {
    onDisconnected(activePlayerId);
    wordForm.fields.disabled = true;

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
 * @param {Object} data the data to send to the server
 */
function sendMessage(data) {
  if (socket) {
    socket.send(JSON.stringify(data));
  }
}

window.onload = () => {
  activePlayerId = getParam('player');
  scorepadId = getParam('scorepad');

  document.getElementById('selection-link').href = `/jank/selection.html?scorepad=${scorepadId}`;

  wordForm = document.getElementById('word-form');
  wordForm.onsubmit = (e) => {
    e.preventDefault();

    const word = wordForm.word.value;
    sendMessage({ word });

    wordForm.word.value = '';
  };

  sendRequest('GET', `/api/scorepads/${scorepadId}`, (scorepad) => {
    scorepad.players.forEach((player) => {
      if (player._id === activePlayerId) {
        const headerText = `Hallo ${player.name}, schön dass du dabei bist!`;
        document.getElementById('player-header').textContent = headerText;
      }

      addPlayer(player);
    });

    // after all the game data has been received, connect to the server's web socket
    connectToSocket();
  });
};
