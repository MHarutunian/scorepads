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
 * The map from player IDs to the corresponding table cells representing them.
 */
const playerCells = {};

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

  const firstWord = row.insertCell();
  firstWord.textContent = '???';
  const secondWord = row.insertCell();
  secondWord.textContent = '???';
  const partner = row.insertCell();
  partner.textContent = '???';

  playerCells[player._id] = {
    player: playerCell,
    firstWord,
    secondWord,
    partner
  };
}

/**
 * Adds a word to the corresponding cell of the specified player.
 *
 * @param {string} playerId the ID of the player to add the word for
 * @param {string} word the word to add for the player
 */
function addWord(playerId, word) {
  if (playerCells[playerId]) {
    if (playerCells[playerId].firstWord.textContent === '???') {
      playerCells[playerId].firstWord.textContent = word;
    } else {
      playerCells[playerId].secondWord.textContent = word;
    }
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
  const data = JSON.parse(message.data);

  if (data.type === 'connect') {
    onConnected(data.playerId);
  } else if (data.type === 'disconnect') {
    onDisconnected(data.playerId);
  }
}

/**
 * Connects the player with the specified ID to the server's web socket endpoint.
 *
 * @param {string} playerId the ID of the player to connect
 */
function connectToSocket(playerId) {
  const { host } = window.location;
  const socket = new WebSocket(`ws://${host}/ws/scorepads/${scorepadId}?playerId=${playerId}`);

  socket.onopen = () => onConnected(playerId);
  socket.onclose = () => onDisconnected(playerId);
  socket.onmessage = handleMessage;
  socket.onerror = (e) => {
    // TODO error handling
    console.log(`Socket Error: ${e}`); // eslint-disable-line
  };
}

window.onload = () => {
  const playerId = getParam('player');
  scorepadId = getParam('scorepad');

  document.getElementById('selection-link').href = `/jank/selection.html?scorepad=${scorepadId}`;

  const form = document.getElementById('word-form');
  form.onsubmit = (e) => {
    e.preventDefault();

    addWord(playerId, form.word.value);
    form.word.value = '';
  };

  sendRequest('GET', `/api/scorepads/${scorepadId}`, (scorepad) => {
    scorepad.players.forEach((player) => {
      if (player._id === playerId) {
        const headerText = `Hallo ${player.name}, schön dass du dabei bist!`;
        document.getElementById('header').textContent = headerText;
      }

      addPlayer(player);
    });

    // after all the game data has been received, connect to the server's web socket
    connectToSocket(playerId);
  });
};
