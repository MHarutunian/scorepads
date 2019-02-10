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
  });
};
