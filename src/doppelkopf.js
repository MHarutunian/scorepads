import sendRequest from './utils/sendRequest';
import getPictureSrc from './utils/getPictureSrc';
import PlayerSelectHelper from './utils/PlayerSelectHelper';
import './css/common.css';
import './css/doppelkopf.css';

/**
 * The HTML element used to display the list of scorepads.
 */
let scorepadList;

/**
 * Redirects the user to the specified scorepad.
 *
 * @param {Object} scorepad the scorepad to redirect the user to
 */
function redirectToScorepad(scorepad) {
  window.location.href = `doppelkopfSchreiben.html?scorepad=${scorepad._id}`;
}

/**
 * Creates a scorepad with the specified selected players and redirects the user to it.
 */
function initScorepad() {
  const playerIds = [];

  for (let i = 1; i < 5; i += 1) {
    const playerSelect = document.getElementById(`player${i}`);
    const { value } = playerSelect;

    if (!value) {
      // Invalid player selection - TODO: show error message?
      console.error('Selected player does not exist!');
      return;
    }

    playerIds.push(value);
  }

  sendRequest('POST', '/api/scorepads', redirectToScorepad, {
    game: 'Doppelkopf',
    players: playerIds
  });
}

/**
 * Creates a player as an HTML element.
 *
 * @param {Object} player the player to create the HTML element from
 * @return {HTMLSpanElement} the HTML element representing the player
 */
function createPlayerElement(player) {
  const playerElement = document.createElement('span');
  playerElement.className = 'player';

  const picture = document.createElement('img');
  picture.className = 'player-picture';
  picture.src = getPictureSrc(player && player.picture);
  playerElement.appendChild(picture);

  const name = player ? player.name : 'Undefined';
  playerElement.appendChild(document.createTextNode(name));
  return playerElement;
}

/**
 * Creates a scorepad as an HTML list item.
 *
 * @param {Object} scorepad the scorepad to create the HTML element from
 * @return {HTMLLIElement} the HTML list item representing the scorepad
 */
function createScorepadElement(scorepad) {
  const listItem = document.createElement('li');
  listItem.className = 'scorepad';

  const game = document.createElement('span');
  game.className = 'game';
  game.appendChild(document.createTextNode(scorepad.game));
  listItem.appendChild(game);

  scorepad.players.forEach((player) => {
    listItem.appendChild(createPlayerElement(player));
  });

  const date = new Date(scorepad.created_at);
  const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  listItem.appendChild(document.createTextNode(formattedDate));

  const loadButton = document.createElement('button');
  loadButton.type = 'button';
  loadButton.onclick = () => {
    redirectToScorepad(scorepad);
  };
  loadButton.appendChild(document.createTextNode('Spiel laden'));
  listItem.appendChild(loadButton);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.onclick = () => {
    sendRequest('DELETE', `/api/scorepads/${scorepad._id}`, () => {
      scorepadList.removeChild(listItem);
    });
  };
  deleteButton.textContent = 'Spiel löschen';
  listItem.appendChild(deleteButton);

  return listItem;
}

window.onload = () => {
  sendRequest('GET', '/api/players', (players) => {
    const playerSelect = document.getElementById('player-select');
    const beginButton = document.getElementById('begin');
    const playerSelects = Array.from(playerSelect.getElementsByTagName('select'));

    const playerSelectHelper = new PlayerSelectHelper(players, beginButton);
    playerSelectHelper.addAll(playerSelects);

    beginButton.onclick = initScorepad;
  });

  scorepadList = document.getElementById('scorepad-list');
  sendRequest('GET', '/api/scorepads', (scorepads) => {
    scorepads.forEach((scorepad) => {
      scorepadList.appendChild(createScorepadElement(scorepad));
    });
  });
};
