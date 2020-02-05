const { MongoClient } = require('mongodb');
const config = require('../config/config');

const { host, port, path } = config.mongodb;
const options = { useNewUrlParser: true };

let db = null;

MongoClient.connect(`mongodb://${host}:${port}/${path}`, options, (error, dbClient) => {
  if (error) {
    throw error;
  }

  db = dbClient.db();
});

/**
 * Connects to the MongoDB instance specified in the configuration.
 *
 * @returns {Db} the connected Mongo DB instance
 */
function getDb() {
  return db;
}

module.exports = getDb;
