/**
 * The HTML element used to display the list of players.
 */
let list;
/**
 * The HTML form used to create/update players.
 */
let form;

/**
 * Sends a request to the API server.
 *
 * @param {string} method the HTTP method to use (e.g. GET/PUT/DELETE)
 * @param {string} path the path to send the request to
 * @param {function} onResponse the function to execute with the parsed
 *        JSON response received from the server
 */
function sendRequest(method, path, onResponse) {
  const request = new XMLHttpRequest();
  request.open(method, path);
  request.addEventListener('load', () => {
    if (request.status >= 200 && request.status < 300) {
      const jsonResponse = JSON.parse(request.responseText);
      onResponse(jsonResponse);
    } else {
      console.warn(request.statusText, request.responseText);
    }
  });
  request.send();
}

function editPlayer(player) {
  const { id, name } = form.elements;
  id.value = player._id;
  name.value = player.name;
}

/**
 * Adds a player to the list by create HTML elements based on the model.
 *
 * @param {Object} player the player model used to create the player list item
 */
function addPlayer(player) {
  if (!list) {
    list = document.getElementById('player-list');
  }

  const item = document.createElement('li');
  item.id = player._id;
  item.className = 'player-item';
  item.appendChild(document.createTextNode(player.name));

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'player-button';
  button.onclick = () => {
    editPlayer(player);
  };
  button.appendChild(document.createTextNode('bearbeiten'));

  item.appendChild(button);
  list.appendChild(item);
}

/**
 * Initializes the list of players.
 *
 * This will first fetch all existing players from the server and then add each
 * player to the HTML list.
 *
 * @see addPlayer
 */
function initPlayers() {
  sendRequest('GET', '/api/players', (players) => {
    players.forEach(addPlayer);
  });
}

/**
 * Sends a player model to the server.
 *
 * If the player does not exist yet, a new player will be created using the server API and
 * the player will be added to the list. Otherwise the existing player will be updated in
 * both the server and the list.
 *
 * @param {string} id the ID of the player. If this is empty, a new player will be created
 * @param {string} name the name of the player
 */
function sendPlayer(id, name) {
  if (id) {
    console.log(id, name);
  } else {
    sendRequest('GET', `/api/players/${name}`, (player) => {
      addPlayer(player);
    });
  }
}

window.onload = () => {
  form = document.getElementById('player-form');
  form.onsubmit = (event) => {
    event.preventDefault();
    const { id, name } = form.elements;
    sendPlayer(id.value, name.value);
    form.reset();
  };

  initPlayers();
};
