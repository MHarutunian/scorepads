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
 * Executes a callback whenever the WebSocket receives a message.
 *
 * @param {function} callback the callback to execute when the socket receives a message
 */
WsWrapper.prototype.onMessage = function (callback) {
  this.socket.on('message', (data) => callback(JSON.parse(data)));
};

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
  this.send('connect', playerId);
};

/**
 * Sends a message through the socket to inform the client that a player has disconnected.
 *
 * @param {string} playerId the ID of the player that has disconnected
 */
WsWrapper.prototype.disconnect = function (playerId) {
  this.send('disconnect', playerId);
};

/**
 * Sends a message through the socket to inform the client about an error.
 *
 * @param {string} message the error message to send to the client
 */
WsWrapper.prototype.error = function (message) {
  this.send('error', message);
};

/**
 * Sends a message (as JSON) through the socket.
 *
 * @param {string} type the type of the message to send
 * @param {string|Object} payload the payload to send to the client
 */
WsWrapper.prototype.send = function (type, payload) {
  if (this.isConnected()) {
    this.socket.send(JSON.stringify({ type, payload }));
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
