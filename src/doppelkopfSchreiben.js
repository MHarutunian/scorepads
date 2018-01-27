import noUiSlider from 'nouislider';
import 'nouislider/distribute/nouislider.min.css';

import sendRequest from './utils/sendRequest';
import addPlayers from './utils/addPlayers';

/**
 * Options used for range sliders that set the score and bidding values.
 */
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
 * ID of the scorepad that is being edited.
 */
let scorepadId;

/**
 * List of players of scorepad.
 */
let players;

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

/**
 * Initializes the range sliders used to set the points and bidding.
 */
function initSliders() {
  const pointsSlider = document.getElementById('slider-points');
  const biddingSlider = document.getElementById('slider-bidding');
  noUiSlider.create(pointsSlider, sliderOptions);
  noUiSlider.create(biddingSlider, sliderOptions);

  // ensure that enemy points cannot be higher than bidding
  // otherwise the match would be lost
  biddingSlider.noUiSlider.on('slide', ([value]) => {
    if (value < pointsSlider.noUiSlider.get()) {
      pointsSlider.noUiSlider.set(value);
    }
  });

  pointsSlider.noUiSlider.on('slide', ([value]) => {
    if (value > biddingSlider.noUiSlider.get()) {
      biddingSlider.noUiSlider.set(value);
    }
  });
}

/**
 * Adds a match to the HTML scorepad table.
 *
 * @param {Object} match the match to add to the HTML scorepad
 */
function addMatch(match) {
  console.log(match);
  const table = document.getElementById('table');
  const row = table.insertRow();
  for (let i = 0; i < 4; i += 1) {
    const playerCell = row.insertCell();
    // eslint-disable-next-line no-loop-func
    const isWinner = match.winners.some(winnerId => winnerId === players[i]._id);
    playerCell.textContent = isWinner ? match.score : '0';
  }
  const scoreCell = row.insertCell();
  scoreCell.textContent = match.score;

  match.winners.forEach((winnerId) => {
    const winnerCell = row.insertCell();
    const winner = players.find(player => (player._id === winnerId));
    winnerCell.textContent = winner.name;
  });
}

/**
 * Saves a match to this scorepad using the values entered by the user.
 *
 * @param {Event} event the form submit event that triggered the save
 */
function saveMatch(event) {
  event.preventDefault();

  const pointsSlider = document.getElementById('slider-points');
  const biddingSlider = document.getElementById('slider-bidding');
  const {
    winner1,
    winner2,
    team,
    bid,
    'special-points': specialPoints
  } = event.target.elements;

  const bids = Array.from(bid).filter(checkbox => checkbox.checked);

  const match = {
    winners: [winner1.value, winner2.value],
    team: team.value,
    bids: bids.map(checkbox => checkbox.value),
    points: pointsSlider.noUiSlider.get(),
    bidding: biddingSlider.noUiSlider.get(),
    specialPoints: parseInt(specialPoints.value, 10)
  };

  sendRequest('POST', `/api/scorepads/${scorepadId}/matches`, (update) => {
    addMatch({
      ...match,
      ...update
    });
  }, match);
}

window.onload = () => {
  scorepadId = getParam('scorepad');
  sendRequest('GET', `/api/scorepads/${scorepadId}`, (scorepad) => {
    players = scorepad.players; // eslint-disable-line prefer-destructuring
    for (let i = 1; i < 5; i += 1) {
      const playerText = document.createTextNode(players[i - 1].name);
      document.getElementById(`playerSel${i}`).appendChild(playerText);
    }
    for (let i = 1; i < 3; i += 1) {
      const winnerSelect = document.getElementById(`winner${i}`);
      addPlayers(winnerSelect, players);
      winnerSelect.selectedIndex = -1;
    }
    scorepad.matches.forEach(addMatch);
  });

  initSliders();

  for (let i = 0; i < 10; i += 1) {
    const specialPoints = document.getElementById('special-points');
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    specialPoints.appendChild(opt);
  }

  const form = document.getElementById('write-blog');
  form.onsubmit = saveMatch;
};
