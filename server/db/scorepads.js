const { ObjectID } = require('mongodb');
const Model = require('./Model');
const dbPlayers = require('./players');
const { calculateMatchScore } = require('../game/registry');

const scorepadModel = new Model('scorepads');

/**
 * Initializes a scorepad by replacing the player IDs with actual player documents.
 *
 * This also adds a `created_at` timestamp from the document's generated ID.
 *
 * @param {Object} scorepad the scorepad to initialize
 * @param {Object[]} players the list of players to use when mapping scorepad players
 */
function initScorepad(scorepad, players) {
  return {
    ...scorepad,
    players: scorepad.players.map(id => players.find(player => player._id.equals(id))),
    created_at: scorepad._id.getTimestamp()
  };
}

/**
 * Retrieves all scorepads from the database.
 *
 * @param {Object} query contains URL query parameters (e.g. gameName)
 * @param {function} onResult callback that is executed with the result documents from the database
 */
function get(query, onResult) {
  scorepadModel.find(query, (scorepads) => {
    dbPlayers.get((players) => {
      onResult(scorepads.map(scorepad => initScorepad(scorepad, players)));
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
    if (scorepad) {
      const playerIds = scorepad.players.map(playerId => ObjectID(playerId));

      dbPlayers.findBy('_id', playerIds, (players) => {
        onResult(initScorepad(scorepad, players));
      });
    } else {
      onResult(null);
    }
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
  scorepadModel.insertOne(
    {
      game,
      players,
      matches: []
    },
    onResult
  );
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

/**
 * Adds a match to a scorepad document.
 *
 * @param {string} id the ID of the scorepad to add the match to
 * @param {Object} match the match to add to the scorepad
 * @param {function} onResult the callback to execute with the document update
 */
function addMatch(id, match, onResult) {
  scorepadModel.findOne(id, (scorepad) => {
    const update = {
      _id: new ObjectID(),
      score: calculateMatchScore(scorepad.game, match)
    };

    scorepadModel.withCollection((collection) => {
      collection.updateOne(
        {
          _id: scorepad._id
        },
        {
          $push: {
            matches: {
              ...match,
              ...update
            }
          }
        },
        (error) => {
          if (error) {
            throw error;
          }

          onResult(update);
        }
      );
    });
  });
}

/**
 * Updates an existing match for a scorepad document and re-calculates its score.
 *
 * @param {string} scorepadId the ID of the scorepad to update the match for
 * @param {string} matchId the ID of the match to update
 * @param {Object} match the updated match
 * @param {function} onResult the callback to execute with the updated score
 */
function updateMatch(scorepadId, matchId, match, onResult) {
  scorepadModel.findOne(scorepadId, (scorepad) => {
    const score = calculateMatchScore(scorepad.game, match);
    const update = {};
    Object.keys(match).forEach((key) => {
      update[`matches.$.${key}`] = match[key];
    });

    scorepadModel.withCollection((collection) => {
      collection.updateOne(
        {
          _id: scorepad._id,
          'matches._id': ObjectID(matchId)
        },
        {
          $set: {
            ...update,
            'matches.$.score': score
          }
        },
        (error) => {
          if (error) {
            throw error;
          }

          onResult(score);
        }
      );
    });
  });
}

exports.findById = findById;
exports.get = get;
exports.add = add;
exports.deleteById = deleteById;
exports.addMatch = addMatch;
exports.updateMatch = updateMatch;
