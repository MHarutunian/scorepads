const { MongoClient } = require('mongodb');

const config = require('../config/config');

const { host, port, path } = config.mongodb;
const url = `mongodb://${host}:${port}/${path}`;

/**
 * Connects to the MongoDB instance specified in the configuration.
 *
 * @param {function} onConnect callback that is executed with the connected database
 */
function connect(onConnect) {
  MongoClient.connect(url, (error, db) => {
    if (error) {
      throw error;
    }

    onConnect(db);
  });
}

module.exports = connect;
