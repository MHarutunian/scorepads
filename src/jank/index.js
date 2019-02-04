import getPictureSrc from '../utils/getPictureSrc';
import PlayerSelectHelper from '../utils/PlayerSelectHelper';
import sendRequest from '../utils/sendRequest';
import '../css/common.css';
import '../css/jank/index.css';
import getScorepads from '../utils/getScorepads';

/**
 * The minimum number of players required for playing JanK.
 */
const MIN_PLAYERS = 4;

/**
 * The list of available players.
 */
let players;

/**
 * The `PlayerSelectHelper` used to manage the player `<select>` elements.
 */
let playerSelectHelper;

/**
 * Redirects the user to the player selection of the specified scorepad.
 *
 * @param {Object} scorepad the scorepad to redirect to
 */
function redirectToPlayerSelection(scorepad) {
  window.location.href = `/jank/selection.html?scorepad=${scorepad._id}`;
}

/**
 * Adds a player select element to the list of players.
 *
 * @returns {HTMLSelectElement} the select element of the player element that was added
 */
function addPlayerSelect() {
  const position = playerSelectHelper.count() + 1;
  const selectionContainer = document.getElementById('player-selection');

  const container = document.createElement('div');
  container.className = 'player';

  const select = document.createElement('select');
  container.appendChild(select);

  const picture = document.createElement('img');
  picture.className = 'player-picture';
  picture.src = getPictureSrc();
  container.appendChild(picture);

  const name = document.createTextNode(`Wer ist Spieler ${position}?`);
  container.appendChild(name);

  select.onchange = () => {
    const player = players.find(p => p._id === select.value);

    if (player) {
      picture.src = getPictureSrc(player.picture);
      name.nodeValue = player.name;
    }
  };
  playerSelectHelper.add(select);

  if (playerSelectHelper.count() > MIN_PLAYERS) {
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Spieler entfernen';
    deleteButton.onclick = () => {
      selectionContainer.removeChild(container);
      playerSelectHelper.remove(select);
    };

    container.appendChild(deleteButton);
  }

  selectionContainer.appendChild(container);
  return select;
}

window.onload = () => {
  const beginButton = document.getElementById('begin');
  sendRequest('GET', '/api/players', (result) => {
    players = result;
    const addPlayerButton = document.getElementById('add-player');

    playerSelectHelper = new PlayerSelectHelper(players, beginButton);

    for (let i = 0; i < MIN_PLAYERS; i += 1) {
      addPlayerSelect();
    }

    addPlayerButton.onclick = addPlayerSelect;
    addPlayerButton.disabled = false;
  });

  beginButton.onclick = () => {
    sendRequest('POST', '/api/scorepads', redirectToPlayerSelection, {
      game: 'JanK',
      players: playerSelectHelper.selects.map(s => s.value)
    });
  };

  const scorepadList = document.getElementById('scorepad-list');
  getScorepads('JanK', scorepadList, redirectToPlayerSelection);
};
