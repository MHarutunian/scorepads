const { MongoClient } = require('mongodb');
const config = require('../config/config');

const { host, port, path } = config.mongodb;
const url = `mongodb://${host}:${port}/${path}`;

function connect() {
  MongoClient.connect(url, (error, db) => {
    if (error) {
      throw error;
    }

    db.close();
  });
}

module.exports = {
  connect
};
