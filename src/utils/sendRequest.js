/**
 * Sends a request to the API server.
 *
 * @param {string} method the HTTP method to use (e.g. GET/PUT/DELETE)
 * @param {string} path the path to the API endpoint to send the request to
 * @param {function} onResponse the function to execute with the parsed
 *        JSON response received from the server
 * @param {Object} [body] the object to send as JSON in the request body
 */
export default function sendRequest(method, path, onResponse, body = null) {
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
