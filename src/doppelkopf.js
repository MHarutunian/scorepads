/**
 * Sends a request to the API server.
 *
 * @param {string} method the HTTP method to use (e.g. GET/PUT/DELETE)
 * @param {string} path the path to the API endpoint to send the request to
 * @param {function} onResponse the function to execute with the parsed
 *        JSON response received from the server
 * @param {Object} body the object to send as JSON in the request body
 */
function sendRequest(method, path, onResponse, body = null) {
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

function addPlayers(select, players) {
  for (let i = 0; i < players.length; i += 1) {
    const option = document.createElement('option');
    const player = players[i];
    option.appendChild(document.createTextNode(player.name));
    select.appendChild(option);
  }
}

/**
 * Redirects the user to the scorepad that was created with the selected players.
 *
 * @param {Object[]} players the players fetched from the API. Used to create the scorepad
 */
function redirectToScorepad(players) {
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

  sendRequest('POST', '/api/scorepads', (scorepad) => {
    window.location.href = `doppelkopfSchreiben.html?scorepad=${scorepad._id}`;
  }, {
    players: playerIds
  });
}

window.onload = () => {
  sendRequest('GET', '/api/players', (players) => {
    for (let i = 1; i < 5; i += 1) {
      const playerSelect = document.getElementById(`player${i}`);
      addPlayers(playerSelect, players);
      playerSelect.selectedIndex = -1;
    }

    const beginButton = document.getElementById('begin');
    beginButton.onclick = () => redirectToScorepad(players);
  });
};
