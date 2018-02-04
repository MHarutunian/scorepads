import noUiSlider from 'nouislider';
import 'nouislider/distribute/nouislider.min.css';

import sendRequest from './utils/sendRequest';
import initPlayerSelects from './utils/initPlayerSelects';
import getPictureSrc from './utils/getPictureSrc';
import './css/common.css';
import './css/doppelkopfSchreiben.css';

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
 * Maximum number of special points that can be selected (positive or negative).
 */
const SPECIAL_MAX = 5;

/**
 * Value in the player select used to indicate that the match was a solo.
 */
const PLAYER_SOLO = 'SOLO';

/**
 * ID of the scorepad that is being edited.
 */
let scorepadId;

/**
 * List of players of scorepad.
 */
let players;

/**
 * The HTML form used to enter and save match data.
 */
let form;

/**
 * Slider used to select the points when saving a match.
 */
let pointsSlider;

/**
 * Slider used to select the bidding when saving a match.
 */
let biddingSlider;

/**
 * Dealer of current game.
 */
let dealer;

/**
 * Count of matches played.
 */
let matchIndex = 0;

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
 * Creates and returns an HTML element representing a player object.
 *
 * The HTML element contains both the picture and the name of the player.
 *
 * @param {Object} player the player to create the span element for
 * @return HTMLSpanElement the HTML element representing the `player`
 */
function createPlayerSpan(player) {
  const playerSpan = document.createElement('span');
  playerSpan.className = 'player-item';

  const playerPicture = document.createElement('img');
  playerPicture.className = 'player-picture';
  playerPicture.src = getPictureSrc(player.picture);

  playerSpan.appendChild(playerPicture);
  playerSpan.appendChild(document.createTextNode(player.name));

  return playerSpan;
}

/**
 * Adds a match to the HTML scorepad table.
 *
 * @param {Object} match the match to add to the HTML scorepad
 */
function addMatch(match) {
  const table = document.getElementById('table');
  const row = table.insertRow();
  const isSolo = match.winners.some(winnerId => winnerId === PLAYER_SOLO);
  let winnerScore = isSolo ? match.score * 3 : match.score;
  let loserScore = isSolo ? -match.score : 0;

  // if the match was a solo, but kontra is the winning team,
  // the selected winners are actually losers
  if (isSolo && match.team === 'kontra') {
    winnerScore = -winnerScore;
    loserScore = -loserScore;
  }

  for (let i = 0; i < 4; i += 1) {
    const playerCell = row.insertCell();
    playerCell.className = 'playerCell';
    const player = players[i];
    const isWinner = match.winners.some(winnerId => winnerId === player._id);

    player.score += isWinner ? winnerScore : loserScore;
    playerCell.textContent = player.score;
  }

  const scoreCell = row.insertCell();
  scoreCell.className = 'scoreCell';
  scoreCell.textContent = match.score;

  match.winners.forEach((winnerId) => {
    const winnerCell = row.insertCell();
    winnerCell.className = 'winnerCell';

    if (winnerId === PLAYER_SOLO) {
      winnerCell.textContent = PLAYER_SOLO;
    } else {
      const winner = players.find(player => (player._id === winnerId));
      winnerCell.textContent = winner ? winner.name : 'Unbekannt';
    }
  });

  matchIndex += 1;
  if ((matchIndex) % players.length === 0) {
    row.className = 'new-round';
  }
}

/**
 * Creates and returns an HTML element used to display the current dealer.
 *
 * @return HTMLSpanElement the element displaying the current dealer
 */
function createDealerSpan() {
  let dealerIndex;

  if (matchIndex > 0) {
    dealerIndex = (matchIndex - 1) % players.length;
  } else {
    dealerIndex = players.length - 1;
  }

  return createPlayerSpan(players[dealerIndex]);
}


function hidePopup() {
  const saveButton = document.getElementById('save-button');
  const {
    winner1,
    winner2,
    'special-points': specialPoints
  } = form.elements;
  form.reset();
  saveButton.disabled = true;
  specialPoints.selectedIndex = SPECIAL_MAX;
  pointsSlider.noUiSlider.set(sliderOptions.start);
  biddingSlider.noUiSlider.set(sliderOptions.start);

  /* eslint-disable no-param-reassign */
  [winner1, winner2].forEach((winnerSelect) => {
    winnerSelect.selectedIndex = -1;
    Array.from(winnerSelect.options).forEach((option) => {
      option.disabled = false;
    });
  });
  /* eslint-enable no-param-reassign */
  const popup = document.getElementById('write-popup');
  popup.style.display = 'none';
}
/**
 * Saves a match to this scorepad using the values entered by the user.
 */
function saveMatch() {
  const {
    winner1,
    winner2,
    team,
    bid,
    'special-points': specialPoints
  } = form.elements;

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
    dealer.replaceChild(createDealerSpan(), dealer.firstChild);

    hidePopup();
  }, match);
}


/**
 * Initializes the select elements that are used to select a match's winners.
 */
function initWinnerSelects() {
  const saveButton = document.getElementById('save-button');
  const winnerSelects = [
    form.elements.winner1,
    form.elements.winner2
  ];

  winnerSelects.forEach((winnerSelect) => {
    const soloOption = document.createElement('option');
    soloOption.value = PLAYER_SOLO;
    soloOption.textContent = PLAYER_SOLO;
    winnerSelect.appendChild(soloOption);
  });
  initPlayerSelects(winnerSelects, players, saveButton);
}

window.onload = () => {
  scorepadId = getParam('scorepad');
  pointsSlider = document.getElementById('slider-points');
  biddingSlider = document.getElementById('slider-bidding');
  form = document.getElementById('write-blog');

  sendRequest('GET', `/api/scorepads/${scorepadId}`, (scorepad) => {
    const tableHeader = document.getElementById('scorepad-header');
    players = scorepad.players.map(player => ({
      ...player,
      score: 0
    }));

    const gameHeader = tableHeader.firstChild;
    players.forEach((player) => {
      const playerHeader = document.createElement('th');
      playerHeader.className = 'player';

      playerHeader.appendChild(createPlayerSpan(player));
      tableHeader.insertBefore(playerHeader, gameHeader);
    });

    initWinnerSelects();
    scorepad.matches.forEach(addMatch);

    dealer = document.getElementById('dealer');
    dealer.appendChild(createDealerSpan());
  });

  initSliders();

  const specialPoints = document.getElementById('special-points');
  for (let i = -SPECIAL_MAX; i <= SPECIAL_MAX; i += 1) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    specialPoints.appendChild(opt);
  }
  specialPoints.selectedIndex = SPECIAL_MAX;

  const addButton = document.getElementById('add-match');

  addButton.onclick = () => {
    const popup = document.getElementById('write-popup');
    popup.style.display = 'block';
  };

  const abortButton = document.getElementById('abort-button');

  abortButton.onclick = () => {
    hidePopup();
  };

  const writePopup = document.getElementById('write-popup');

  writePopup.onclick = (event) => {
    if (event.target === writePopup) {
      hidePopup();
    }
  };

  form.onsubmit = (event) => {
    event.preventDefault();
    saveMatch();
  };
};
