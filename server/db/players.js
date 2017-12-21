const Model = require('./Model');

const playerModel = new Model('players');

/**
 * Finds multiple players by the specified query object.
 *
 * @param {Object} query the query object used to filter players
 * @param {function} onResult callback that is executed with the result documents that were found
 */
function find(query, onResult) {
  playerModel.find(query, onResult);
}

/**
 * Finds a single player by its ID.
 *
 * @param {string} id the ID of the player to find
 * @param {function} onResult callback that is executed with the player that was found
 * @see Model#findOne
 */
function findById(id, onResult) {
  playerModel.findOne(id, onResult);
}

/**
 * Finds multiple players by the specified value.
 *
 * @param {string} field the field used to filter players
 * @param {*} value the value the player documents are matched against
 * @param {function} onResult callback that is executed with the players that were found
 * @see Model#findBy
 */
function findBy(field, value, onResult) {
  playerModel.findBy(field, value, onResult);
}

/**
 * Retrieves all players from the database.
 *
 * @param {function} onResult callback that is executed with all documents from the database
 */
function get(onResult) {
  find({}, onResult);
}

/**
 * Adds a player to the database.
 *
 * @param {string} name the name of the player to add
 * @param {string} [picture] the filename of the player's profile picture
 * @param {function} onResult callback that is executed with the player document that was added
 * @see Model#insertOne
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
 * @see Model#updateOne
 */
function update(id, name, picture, onResult) {
  playerModel.updateOne(id, { name, picture }, onResult);
}

exports.find = find;
exports.findBy = findBy;
exports.findById = findById;
exports.get = get;
exports.add = add;
exports.update = update;
