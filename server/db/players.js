const Model = require('./Model');

const playerModel = new Model('players');

/**
 * Retrieves all players from the database.
 *
 * @param {function} onResult callback that is executed with the result documents from the database
 */
function get(onResult) {
  playerModel.find({}, onResult);
}

/**
 * Finds a single player by its ID.
 *
 * @param {string} id the ID of the player to find
 * @param {function} onResult callback that is executed with the player that was found
 */
function find(id, onResult) {
  playerModel.findOne(id, onResult);
}

/**
 * Adds a player to the database.
 *
 * @param {string} name the name of the player to add
 * @param {string} [picture] the filename of the player's profile picture
 * @param {function} onResult callback that is executed with the player document that was added
 */
function add(name, picture, onResult) {
  playerModel.insertOne({
    name,
    picture
  }, onResult);
}

/**
 * Updates a player document.
 *
 * @param {string} id the id of the player to update
 * @param {string} name the updated name of the player
 * @param {string} [picture] the updated filename of the player's profile picture
 * @param {function} onResult callback that is executed with a boolean to indicate whether the
 *        update operation was successful
 */
function update(id, name, picture, onResult) {
  playerModel.updateOne(id, { name, picture }, onResult);
}

exports.get = get;
exports.find = find;
exports.add = add;
exports.update = update;
