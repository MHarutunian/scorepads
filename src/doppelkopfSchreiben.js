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
 * The ID of the match currently being edited, if any.
 */
let matchId = null;

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
  const { _id: id, winners, team, score } = match;
  const table = document.getElementById('table');
  const existingMatch = document.getElementById(id);

  let rowIndex = -1;
  if (existingMatch !== null) {
    rowIndex = existingMatch.rowIndex;
    existingMatch.parentNode.removeChild(existingMatch);
  }

  const row = table.insertRow(rowIndex);
  row.id = id;

  const isSolo = winners.some(winnerId => winnerId === PLAYER_SOLO);
  let winnerScore = isSolo ? score * 3 : score;
  let loserScore = isSolo ? -score : 0;

  // if the match was a solo, but kontra is the winning team,
  // the selected winners are actually losers
  if (isSolo && team === 'kontra') {
    winnerScore = -winnerScore;
    loserScore = -loserScore;
  }

  for (let i = 0; i < 4; i += 1) {
    const playerCell = row.insertCell();
    playerCell.className = 'playerCell';
    const player = players[i];
    const isWinner = winners.some(winnerId => winnerId === player._id);
    const existingItem = player.score.find(scoreItem => scoreItem.matchId === id);
    const actualScore = isWinner ? winnerScore : loserScore;

    if (existingItem) {
      existingItem.score = actualScore;
    } else {
      player.score.push({
        matchId: id,
        score: actualScore
      })
    };

    playerCell.textContent = calculateScore(player.score, id);
  }

  if (rowIndex < 0) {
    matchIndex += 1;
  } else {
    // we updated an existing row, so we need to re-calculate the score for all following rows
    Array.from(table.rows).slice(rowIndex + 1).forEach(row => {
      for (let i = 0; i < 4; i += 1) {
        const player = players[i];
        row.cells[i].textContent = calculateScore(player.score, row.id);
      }
    });
  }

  const scoreCell = row.insertCell();
  scoreCell.className = 'scoreCell';
  scoreCell.textContent = score;

  const winnerCell = row.insertCell();
  winnerCell.className = 'winnerCell';

  winners.forEach((winnerId) => {
    if (winnerId !== PLAYER_SOLO) {
      const winner = players.find(player => (player._id === winnerId));
      const winnerName = winner ? winner.name : 'Unbekannt';

      if (winnerCell.textContent) {
        winnerCell.textContent = `${winnerCell.textContent}/${winnerName}`;
      } else {
        winnerCell.textContent = winnerName;
      }
    }
  });

  const buttonCell = row.insertCell();
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.onclick = () => {
    editMatch(match);
  };
  editButton.textContent = 'bearbeiten';
  buttonCell.appendChild(editButton)

  if ((matchIndex) % players.length === 0) {
    row.className = 'new-round';
  }
}

/**
 * Calculates the score for up to a certain match based on a list of items.
 *
 * @param {Object} scoreItems the list of score items used to calculate the total score
 * @param {string} matchId the ID of the match up to which to calculate the score
 */
function calculateScore(scoreItems, matchId) {
  let totalScore = 0;

  for (let i = 0; i < scoreItems.length; i++) {
    const scoreItem = scoreItems[i];
    totalScore += scoreItem.score;

    if (scoreItem.matchId === matchId) {
      break;
    }
  }

  return totalScore;
}

function editMatch(match) {
  const {
    team: teamSelect,
    'special-points': specialPointsSelect
  } = form.elements;
  const {
    winners,
    team,
    bids,
    points,
    bidding,
    specialPoints
  } = match;
  matchId = match._id;

  winners.forEach((winner, i) => {
    const winnerSelect = form.elements[`winner${i + 1}`];
    const winnerOption = Array.from(winnerSelect.options).find(option => option.value === winner);

    if (winnerOption) {
      winnerSelect.selectedIndex = winnerOption.index;
    }
  });

  const bidCheckboxes = Array.from(form.elements.bid);
  bids.forEach((bid) => {
    const checkbox = bidCheckboxes.find(checkbox => checkbox.value === bid);
    checkbox.checked = true;
  });

  teamSelect.value = team;
  specialPointsSelect.selectedIndex = SPECIAL_MAX + specialPoints;
  pointsSlider.noUiSlider.set(points);
  biddingSlider.noUiSlider.set(bidding);

  const saveButton = document.getElementById('save-button');
  saveButton.disabled = false;

  const popup = document.getElementById('write-popup');
  popup.style.display = 'block';
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
  matchId = null;

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

  const url = `/api/scorepads/${scorepadId}/matches`;

  if (matchId !== null) {
    // update an existing match
    sendRequest('PATCH', `${url}/${matchId}`, (response) => {
      addMatch({
        ...match,
        _id: matchId,
        score: response.score
      });
      hidePopup();
    }, match);
  } else {
    // create a new match
    sendRequest('POST', url, (update) => {
      addMatch({
        ...match,
        ...update
      });
      dealer.replaceChild(createDealerSpan(), dealer.firstChild);

      hidePopup();
    }, match);
  }
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
      score: []
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

  form.onsubmit = (event) => {
    event.preventDefault();
    saveMatch();
  };
};
