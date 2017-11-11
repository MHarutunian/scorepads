const connect = require('../db/connect');

/**
 * Executes the specified callback with the `players` collection from the databse.
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
 * Adds a player to the database.
 *
 * @param {string} name the name of the player to add
 * @param {function} onResult callback that is executed with the player document that was added
 */
function add(name, onResult) {
  connect(withCollection((collection) => {
    collection.insertOne({
      name
    }, (error, result) => {
      if (error) {
        throw error;
      }

      onResult(result.ops);
    });
  }));
}

exports.get = get;
exports.add = add;
