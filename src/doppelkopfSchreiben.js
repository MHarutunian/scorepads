import noUiSlider from 'nouislider';
import 'nouislider/distribute/nouislider.min.css';

import sendRequest from './utils/sendRequest';
import addPlayers from './utils/addPlayers';

const sliderOptions = {
  start: 120,
  step: 30,
  connect: 'lower',
  tooltips: false,
  range: {
    min: 0,
    max: 120
  },
  format: {
    to: value => value,
    from: value => value
  },
  pips: {
    mode: 'steps',
    filter: () => 1,
    density: 30
  }
};

/**
 * Retrieves a single query parameter by its key.
 *
 * @param {string} key the key of the query parameter to get
 * @return {string} the query parameter for the specified key or `null` if the
 *         parameter doesn't exist
 */
function getParam(key) {
  const query = window.location.search;
  const keyIndex = query.indexOf(key);

  if (keyIndex < 0) {
    return null;
  }

  const startIndex = query.indexOf('=', keyIndex) + 1;
  const endIndex = query.indexOf('&', keyIndex);

  if (endIndex < startIndex) {
    return query.substring(startIndex);
  }

  return query.substring(startIndex, endIndex);
}


window.onload = () => {
  const scorepadId = getParam('scorepad');
  sendRequest('GET', `/api/scorepads/${scorepadId}`, (scorepad) => {
    const { players } = scorepad;
    for (let i = 1; i < 5; i += 1) {
      const playerText = document.createTextNode(players[i - 1].name);
      document.getElementById(`playerSel${i}`).appendChild(playerText);
    }
    for (let i = 1; i < 3; i += 1) {
      const winnerSelect = document.getElementById(`winner${i}`);
      addPlayers(winnerSelect, players);
      winnerSelect.selectedIndex = -1;
    }
    for (let i = 0; i < 10; i += 1) {
      const specialPoints = document.getElementById('special-points');
      const opt = document.createElement('option');
      opt.value = i;
      opt.innerHTML = i;
      specialPoints.appendChild(opt);
    }
  });

  const scoreSlider = document.getElementById('slider-score');
  const biddingSlider = document.getElementById('slider-bidding');
  noUiSlider.create(scoreSlider, sliderOptions);
  noUiSlider.create(biddingSlider, sliderOptions);
};
