/**
 * The HTML element used to display the list of players.
 */
let list;
/**
 * The header used to display the current action.
 */
let header;
/**
 * The HTML form used to create/update players.
 */
let form;

/**
 * Sends a request to the API server.
 *
 * @param {string} method the HTTP method to use (e.g. GET/PUT/DELETE)
 * @param {function} onResponse the function to execute with the parsed
 *        JSON response received from the server
 * @param {Object} body the object to send as JSON in the request body
 */
function sendRequest(method, onResponse, body = null) {
  const request = new XMLHttpRequest();
  request.open(method, '/api/players');
  request.addEventListener('load', () => {
    if (request.status >= 200 && request.status < 300) {
      const jsonResponse = JSON.parse(request.responseText);
      onResponse(jsonResponse);
    } else {
      console.warn(request.statusText, request.responseText);
    }
  });

  if (body === null) {
    request.send();
  } else {
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(body));
  }
}

/**
 * Sets the text displayed in the form header.
 *
 * @param {string} text the text to set as the form's header
 */
function setHeaderText(text) {
  if (!header) {
    header = document.getElementById('form-header');
  }

  header.textContent = text;
}

/**
 * Enables editing a player in order to update it on the server.
 *
 * @param {Object} player the player to enable editing for
 */
function editPlayer(player) {
  const { id, name } = form.elements;
  id.value = player._id;
  name.value = player.name;

  setHeaderText(`${player.name} bearbeiten`);
}

/**
 * Creates a HTML list item used to display a player's data.
 *
 * @param {Object} player the player to create the list item for
 * @return {HTMLLIElement} the list element representing the player
 */
function createPlayerItem(player) {
  const item = document.createElement('li');
  item.id = player._id;
  item.className = 'player-item';
  return item;
}

/**
 * Adds a player to the list by creating HTML elements based on the model.
 *
 * @param {Object} player the player model used to create the player list item
 * @param {HTMLLIElement} [existingItem] the item to add the player to. If no
 *        item exists, a new item will be created instead
 * @see createPlayerItem
 */
function addPlayer(player, existingItem = null) {
  if (!list) {
    list = document.getElementById('player-list');
  }

  const item = existingItem || createPlayerItem(player);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'player-button';
  button.onclick = () => {
    editPlayer(player);
  };
  button.textContent = 'bearbeiten';

  item.appendChild(document.createTextNode(player.name));
  item.appendChild(button);

  if (item.parentNode !== list) {
    list.appendChild(item);
  }
}

/**
 * Replaces an existing player with a new player object.
 *
 * @param {Object} player the player to be replaced
 */
function replacePlayer(player) {
  const item = document.getElementById(player._id);

  while (item && item.lastChild) {
    item.removeChild(item.lastChild);
  }

  addPlayer(player, item);
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
  sendRequest('GET', (players) => {
    players.forEach((player) => {
      addPlayer(player);
    });
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
    sendRequest('PUT', (player) => {
      replacePlayer(player);
    }, {
      _id: id,
      name
    });
  } else {
    sendRequest('POST', (player) => {
      addPlayer(player);
    }, { name });
  }
}

/**
 * Resets the input form by setting all its values to their defaults.
 */
function resetForm() {
  if (!form) {
    form = document.getElementById('player-form');
  }

  form.reset();
  form.elements.id.value = '';
  setHeaderText('Spieler hinzufügen');
}

window.onload = () => {
  form = document.getElementById('player-form');
  form.onsubmit = (event) => {
    event.preventDefault();
    const { id, name } = form.elements;
    sendPlayer(id.value, name.value);
    resetForm();
  };
  form.onreset = resetForm;

  initPlayers();
  resetForm();
};
