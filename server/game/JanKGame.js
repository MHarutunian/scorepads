/**
 * Creates a new JanK game that several players can connect to through web sockets.
 */
function JanKGame() {
  this.sockets = {};
}

/**
 * Adds a connection for the specified player to the game.
 *
 * This will notify all clients about this player's connection.
 *
 * @param {string} playerId the ID of the player that connected
 * @param {WsWrapper} socket the socket wrapper through which the connection was established
 */
JanKGame.prototype.addConnection = function (playerId, socket) {
  socket.onClose(() => {
    Object.values(this.sockets).forEach((otherSocket) => {
      otherSocket.disconnect(playerId);
    });

    delete this.sockets[playerId];
  });

  Object.keys(this.sockets).forEach((otherPlayerId) => {
    this.sockets[otherPlayerId].connect(playerId);
    socket.connect(otherPlayerId);
  });

  this.sockets[playerId] = socket;
};

/**
 * Checks whether the game is still active, i.e. if any of the players is still connected.
 */
JanKGame.prototype.isActive = function () {
  return Object.values(this.sockets).some(socket => socket.isConnected());
};

module.exports = JanKGame;
