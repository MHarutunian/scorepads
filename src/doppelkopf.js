import sendRequest from './utils/sendRequest';
import getPictureSrc from './utils/getPictureSrc';

/**
 * Adds a list of players as select options to an HTML select element.
 *
 * @param {HTMLSelectElement} select the select element
 * @param {Object[]} players the players to add as select options
 */
function addPlayers(select, players) {
  for (let i = 0; i < players.length; i += 1) {
    const option = document.createElement('option');
    const player = players[i];
    option.appendChild(document.createTextNode(player.name));
    select.appendChild(option);
  }
}

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
 *
 * @param {Object[]} players the players fetched from the API. Used to create the scorepad
 */
function initScorepad(players) {
  const playerIds = [];

  for (let i = 1; i < 5; i += 1) {
    const playerSelect = document.getElementById(`player${i}`);
    const { selectedIndex } = playerSelect;

    if (selectedIndex < 0 || !players[selectedIndex]) {
      // Invalid player selection - TODO: show error message?
      console.error('Selected player does not exist!');
      return;
    }

    playerIds.push(players[selectedIndex]._id);
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
  picture.className = 'picture';
  picture.src = getPictureSrc(player.picture);
  playerElement.appendChild(picture);

  playerElement.appendChild(document.createTextNode(player.name));
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
  loadButton.onclick = () => {
    redirectToScorepad(scorepad);
  };
  loadButton.appendChild(document.createTextNode('Spiel laden'));
  listItem.appendChild(loadButton);

  return listItem;
}

window.onload = () => {
  sendRequest('GET', '/api/players', (players) => {
    for (let i = 1; i < 5; i += 1) {
      const playerSelect = document.getElementById(`player${i}`);
      addPlayers(playerSelect, players);
      playerSelect.selectedIndex = -1;
    }

    const beginButton = document.getElementById('begin');
    beginButton.onclick = () => initScorepad(players);
  });

  const scorepadList = document.getElementById('scorepad-list');
  sendRequest('GET', '/api/scorepads', (scorepads) => {
    scorepads.forEach((scorepad) => {
      scorepadList.appendChild(createScorepadElement(scorepad));
    });
  });
};
