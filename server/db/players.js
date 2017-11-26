const { ObjectID } = require('mongodb');
const connect = require('./connect');

/**
 * Executes the specified callback with the `players` collection from the database.
 *
 * In addition to retrieving the collection and executing the callback, this will properly close
 * the database to prevent dangling connections.
 *
 * @param {function} callback callback that is executed with the `players` collection
 */
function withCollection(callback) {
  return (db) => {
    try {
      const collection = db.collection('players');
      callback(collection);
    } finally {
      db.close();
    }
  };
}

/**
 * Retrieves all players from the database.
 *
 * @param {function} onResult callback that is executed with the result documents from the database
 */
function get(onResult) {
  connect(withCollection((collection) => {
    collection.find({}).toArray((error, players) => {
      if (error) {
        throw error;
      }

      onResult(players);
    });
  }));
}

/**
 * Finds a single player by its ID.
 *
 * @param {string} id the ID of the player to find
 * @param {function} onResult callback that is executed with the player that was found
 */
function find(id, onResult) {
  connect(withCollection((collection) => {
    collection.findOne({
      _id: ObjectID(id)
    }, (error, player) => {
      if (error) {
        throw error;
      }

      onResult(player);
    });
  }));
}

/**
 * Adds a player to the database.
 *
 * @param {string} name the name of the player to add
 * @param {string} [picture] the filename of the player's profile picture
 * @param {function} onResult callback that is executed with the player document that was added
 */
function add(name, picture, onResult) {
  connect(withCollection((collection) => {
    collection.insertOne({
      name,
      picture
    }, (error, result) => {
      if (error) {
        throw error;
      }

      onResult(result.ops[0]);
    });
  }));
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
  connect(withCollection((collection) => {
    collection.updateOne({
      _id: ObjectID(id)
    }, {
      $set: { name, picture }
    }, (error, result) => {
      if (error) {
        throw error;
      }

      onResult(result.result.n > 0);
    });
  }));
}

exports.get = get;
exports.find = find;
exports.add = add;
exports.update = update;
