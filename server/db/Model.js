const { ObjectID } = require('mongodb');
const getDb = require('./getDb');

/**
 * Creates a database model for a named collection.
 *
 * @param {string} name the name of the model's database collection
 */
function Model(name) {
  this.name = name;
}

/**
 * Gets this model's database collection.
 */
Model.prototype.getCollection = function () {
  return getDb().collection(this.name);
};

/**
 * Finds documents using a query object.
 *
 * @param {Object} query the query object used to filter models in the collection
 * @param {function} onResult the callback to execute with the documents that were found
 */
Model.prototype.find = function (query, onResult) {
  this.getCollection()
    .find(query)
    .toArray((error, result) => {
      if (error) {
        throw error;
      }

      onResult(result);
    });
};

/**
 * Finds multiple documents by the specified filter and value.
 *
 * The specified filter `value` may be a primitive value or an array/object.
 *
 * @param {string} field the document field to filter
 * @param {*} value the value of the specified field to match documents against
 * @param {function} onResult the callback to execute with the documents that were found
 */
Model.prototype.findBy = function (field, value, onResult) {
  const query = {};

  if (Array.isArray(value)) {
    query[field] = { $in: value };
  } else {
    query[field] = value;
  }

  this.find(query, onResult);
};

/**
 * Finds a single document by its ID.
 *
 * @param {string} id the ID of the document to find
 * @param {function} onResult the callback to execute with the document that was found
 */
Model.prototype.findOne = function (id, onResult) {
  this.getCollection().findOne(
    {
      _id: ObjectID(id)
    },
    (error, doc) => {
      if (error) {
        throw error;
      }

      onResult(doc);
    }
  );
};

/**
 * Gets the requested number of random documents from this model's collection.
 *
 * @param {Object} query the query to preselect documents before choosing a random number
 * @param {number} size size of the result collection, i.e. the number of random documents to get
 * @param {function} onResult the callback to execute with the list of random results
 */
Model.prototype.getRandom = function (query, size, onResult) {
  const pipeline = [{ $match: query }, { $sample: { size } }];
  this.getCollection()
    .aggregate(pipeline)
    .toArray((error, result) => {
      if (error) {
        throw error;
      }

      onResult(result);
    });
};

/**
 * Inserts a single document in the model's database collection.
 *
 * @param {Object} doc the document to insert
 * @param {function} onResult the callback to exectue with the inserted document
 */
Model.prototype.insertOne = function (doc, onResult) {
  this.getCollection().insertOne(doc, (error, result) => {
    if (error) {
      throw error;
    }

    onResult(result.ops[0]);
  });
};

/**
 * Updates a single document by its ID.
 *
 * @param {string} id the ID of the document to update
 * @param {Object} update the update object used to set new values on the document
 * @param {function} onResult callback executed with a boolean (true for success, false otherwise)
 */
Model.prototype.updateOne = function (id, update, onResult) {
  this.getCollection().updateOne(
    {
      _id: ObjectID(id)
    },
    {
      $set: update
    },
    (error, result) => {
      if (error) {
        throw error;
      }

      onResult(result.result.n > 0);
    }
  );
};

/**
 * Deletes a single document by its ID.
 *
 * @param {string} id the ID of the document to delete
 * @param {function} onResult callback executed with a boolean (true for success, false otherwise)
 */
Model.prototype.deleteOne = function (id, onResult) {
  this.getCollection().deleteOne(
    {
      _id: ObjectID(id)
    },
    (error, result) => {
      if (error) {
        throw error;
      }

      onResult(result.deletedCount > 0);
    }
  );
};

module.exports = Model;
