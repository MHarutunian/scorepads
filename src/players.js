/**
 * The default picture to use for players without uploaded pictures.
 */
const DEFAULT_PICTURE = 'user_default.png';
/**
 * The path to the default API endpoint for players.
 */
const API_PATH = '/api/players';
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
 * The picture being uploaded through the input form.
 */
let profilePicture;

/**
 * Sends a request to the API server.
 *
 * @param {string} path the path to the API endpoint to send the request to
 * @param {string} method the HTTP method to use (e.g. GET/PUT/DELETE)
 * @param {function} onResponse the function to execute with the parsed
 *        JSON response received from the server
 * @param {Object} body the object to send as JSON in the request body
 */
function sendRequest(path, method, onResponse, body = null) {
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
 * Retrieves the path to a picture file based on its file name.
 *
 * @param {string} filename the name of the picture file
 */
function getPictureSrc(filename) {
  return `./picture/${filename || DEFAULT_PICTURE}`;
}

/**
 * Resets the picture upload back to the default image.
 */
function resetPictureUpload() {
  if (profilePicture) {
    profilePicture.src = getPictureSrc();
    form.elements.picture.value = null;
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
  form.elements.id.value = ''; // hidden input is not cleared in `reset()`
  setHeaderText('Spieler hinzufügen');
  resetPictureUpload();
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
  resetPictureUpload();
  profilePicture.src = getPictureSrc(player.picture);
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
  item.className = 'player-flexbox player-item';
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

  const picture = document.createElement('img');
  picture.className = 'player-picture';
  picture.src = getPictureSrc(player.picture);

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'player-button';
  editButton.onclick = () => {
    editPlayer(player);
  };
  editButton.textContent = 'bearbeiten';

  item.appendChild(picture);
  item.appendChild(document.createTextNode(player.name));
  item.appendChild(editButton);

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
  sendRequest(API_PATH, 'GET', (players) => {
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
 * @param {string} picture the picture as a base64 encoded string
 */
function sendPlayer(id, name, picture) {
  const body = {
    name,
    picture
  };

  if (id) {
    sendRequest(`${API_PATH}/${id}`, 'PUT', (player) => {
      replacePlayer(player);
      resetForm();
    }, body);
  } else {
    sendRequest(API_PATH, 'POST', (player) => {
      addPlayer(player);
      resetForm();
    }, body);
  }
}

window.onload = () => {
  form = document.getElementById('player-form');
  profilePicture = document.getElementById('player-picture');

  form.onreset = resetForm;
  form.onsubmit = (event) => {
    event.preventDefault();
    const { id, name } = form.elements;
    sendPlayer(id.value, name.value, profilePicture.src);
  };
  form.elements.picture.onchange = () => {
    const reader = new FileReader();
    const file = form.elements.picture.files[0];

    if (file) {
      reader.onload = () => {
        profilePicture.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const resetPictureButton = document.getElementById('picture-reset');
  resetPictureButton.onclick = resetPictureUpload;

  initPlayers();
  resetForm();
};
