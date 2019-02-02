import sendRequest from './utils/sendRequest';
import getParam from './utils/getParam';
import './css/common.css';
import './css/jank-selection.css';

/**
 * The ID of the player currently playing.
 */
let playerId;

/**
 * The ID of the currently loaded scorepad.
 */
let scorepadId;

window.onload = () => {
  playerId = getParam('player');
  scorepadId = getParam('scorepad');

  document.getElementById('selection-link').href = `jank-selection.html?scorepad=${scorepadId}`;

  sendRequest('GET', `/api/scorepads/${scorepadId}`, (scorepad) => {
    scorepad.players.forEach((player) => {
      if (player._id === playerId) {
        document.getElementById('header').textContent = `Hallo ${player.name}!`;
      }
    });
  });
};
