const { ObjectID } = require('mongodb');

const Model = require('./Model');

const scorepadModel = new Model('scorepads');
const playerModel = new Model('players');

/**
 * Retrieves all scorepads from the database.
 *
 * @param {function} onResult callback that is executed with the result documents from the database
 */
function get(onResult) {
  scorepadModel.find({}, onResult);
}

/**
 * Finds a single scorepad by its ID.
 *
 * This will also fetch all of the player documents associated with the scorepad.
 *
 * @param {string} id the ID of the scorepad to find
 * @param {function} onResult callback that is executed with the scorepad that was found
 */
function find(id, onResult) {
  scorepadModel.findOne(id, (scorepad) => {
    const { players } = scorepad;
    const playerIds = players.map(playerId => ObjectID(playerId));

    playerModel.find({
      _id: { $in: playerIds }
    }, (result) => {
      onResult({
        ...scorepad,
        players: result
      });
    });
  });
}

/**
 * Adds a scorepad to the database.
 *
 * @param {Object[]} players the players to list in the scorepad
 * @param {function} onResult callback that is executed with the scorepad that was added
 */
function add(players, onResult) {
  scorepadModel.insertOne({
    players
  }, onResult);
}

exports.get = get;
exports.find = find;
exports.add = add;
