const WebSocket = require('ws');

/**
 * WebSocket wrapper that ensures uniform communication between server and clients.
 *
 * @param {WebSocket} socket the WebSocket instance to wrap in this instance
 */
function WsWrapper(socket) {
  this.socket = socket;
}

/**
 * Executes a callback whenever the WebSocket is closed.
 *
 * @param {function} callback the callback to execute when the socket is closed
 */
WsWrapper.prototype.onClose = function (callback) {
  this.socket.on('close', callback);
};

/**
 * Sends a message through the socket to inform the client that a player has connected.
 *
 * @param {string} playerId the ID of the player that has connected
 */
WsWrapper.prototype.connect = function (playerId) {
  this.send({ type: 'connect', playerId });
};

/**
 * Sends a message through the socket to inform the client that a player has disconnected.
 *
 * @param {string} playerId the ID of the player that has disconnected
 */
WsWrapper.prototype.disconnect = function (playerId) {
  this.send({ type: 'disconnect', playerId });
};

/**
 * Sends a message through the socket to inform the client about an error.
 *
 * @param {string} message the error message to send to the client
 */
WsWrapper.prototype.error = function (message) {
  this.send({ type: 'error', message });
};

/**
 * Sends a generic JSON message through the socket.
 *
 * @param {Object} data the data to send (as JSON) to the client
 */
WsWrapper.prototype.send = function (data) {
  if (this.isConnected()) {
    this.socket.send(JSON.stringify(data));
  }
};

/**
 * Checks whether this wrapper's socket is still connected.
 *
 * @returns {boolean} is the socket still connected?
 */
WsWrapper.prototype.isConnected = function () {
  return this.socket.readyState === WebSocket.OPEN;
};

module.exports = WsWrapper;
