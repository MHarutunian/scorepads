import sendRequest from '../utils/sendRequest';
import getParam from '../utils/getParam';
import getPictureSrc from '../utils/getPictureSrc';
import '../css/common.css';
import '../css/jank/selection.css';

/**
 * The ID of the scorepad for which to select players.
 */
let scorepadId;

/**
 * Creates a new link with the provided player's picture and name.
 *
 * Upon following the link, the player will join the current scorepad's match
 *
 * @param {Object} player the player to create the link for
 */
function createPlayerLink(player) {
  const playerLink = document.createElement('a');
  playerLink.className = 'player-link';
  playerLink.href = `/jank/match.html?scorepad=${scorepadId}&player=${player._id}`;

  const picture = document.createElement('img');
  picture.src = getPictureSrc(player.picture);
  playerLink.appendChild(picture);

  const name = document.createTextNode(player.name);
  playerLink.appendChild(name);

  const playerContainer = document.getElementById('players');
  playerContainer.appendChild(playerLink);
}

window.onload = () => {
  scorepadId = getParam('scorepad');

  sendRequest('GET', `/api/scorepads/${scorepadId}`, (scorepad) => {
    scorepad.players.forEach(createPlayerLink);
  });
};
