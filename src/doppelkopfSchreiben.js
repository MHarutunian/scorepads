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
  });
};
