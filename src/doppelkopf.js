import sendRequest from './utils/sendRequest';
import PlayerSelectHelper from './utils/PlayerSelectHelper';
import './css/common.css';
import './css/doppelkopf.css';
import getScorepads from './utils/getScorepads';

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
  getScorepads('Doppelkopf', scorepadList, redirectToScorepad);
};
