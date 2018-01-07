const { ObjectID } = require('mongodb');
const Model = require('./Model');
const dbPlayers = require('./players');

const scorepadModel = new Model('scorepads');

/**
 * Retrieves all scorepads from the database.
 *
 * @param {function} onResult callback that is executed with the result documents from the database
 */
function get(onResult) {
  scorepadModel.find({}, (scorepads) => {
    dbPlayers.get((players) => {
      const playerDict = {};
      players.forEach((player) => {
        playerDict[player._id] = player;
      });

      const result = scorepads.map(scorepad => ({
        ...scorepad,
        players: scorepad.players.map(id => playerDict[id]),
        created_at: scorepad._id.getTimestamp()
      }));
      onResult(result);
    });
  });
}

/**
 * Finds a single scorepad by its ID.
 *
 * This will also fetch all of the player documents associated with the scorepad.
 *
 * @param {string} id the ID of the scorepad to find
 * @param {function} onResult callback that is executed with the scorepad that was found
 */
function findById(id, onResult) {
  scorepadModel.findOne(id, (scorepad) => {
    const playerIds = scorepad.players.map(playerId => ObjectID(playerId));

    dbPlayers.findBy('_id', playerIds, (players) => {
      onResult({
        ...scorepad,
        players,
        created_at: scorepad._id.getTimestamp()
      });
    });
  });
}

/**
 * Adds a scorepad to the database.
 *
 * @param {string} game the game the scorepad shall be created for
 * @param {Object[]} players the player documents to list in the scorepad
 * @param {function} onResult callback that is executed with the scorepad that was added
 */
function add(game, players, onResult) {
  scorepadModel.insertOne({
    game,
    players
  }, onResult);
}

/**
 * Deletes a scorepad from the database.
 *
 * @param {string} id the scorepad which should be deleted
 * @param {function} onResult callback that is executed when the scorepad was deleted
 */
function deleteById(id, onResult) {
  scorepadModel.deleteOne(id, onResult);
}

exports.findById = findById;
exports.get = get;
exports.add = add;
exports.deleteById = deleteById;
