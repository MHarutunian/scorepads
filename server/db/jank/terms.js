const Model = require('../Model');

const termModel = new Model('terms');

/**
 * Retrieves all term documents from the database.
 *
 * @param {function} onResult callback that is executed with all documents from the database
 */
function get(onResult) {
  termModel.find({}, onResult);
}

/**
 * Gets a list of random terms for the specified scorepad.
 *
 * @param {Object} scorepad the scorepad to get terms for
 * @param {function} onResult the callback to execute with the list of terms
 */
function getForScorepad(scorepad, onResult) {
  const nrOfPlayers = scorepad.players.length;

  let nrOfJokers;

  if (nrOfPlayers === 4) {
    nrOfJokers = 0;
  } else if (nrOfPlayers % 2 === 1) {
    if (nrOfPlayers > 6) {
      nrOfJokers = Math.random() > 0.5 ? 3 : 1;
    } else {
      nrOfJokers = 1;
    }
  } else {
    nrOfJokers = Math.random() > 0.5 ? 2 : 0;
  }

  const limit = (nrOfPlayers - nrOfJokers) / 2;
  const usedTerms = [];
  scorepad.matches.forEach((match) => {
    Object.values(match.terms).forEach((term) => {
      usedTerms.push(term.value);
    });
  });

  // only select terms at random that haven't been used in this scorepad
  termModel.getRandom({ value: { $nin: usedTerms } }, limit, onResult);
}

/**
 * Finds a single term by its value.
 *
 * @param {string} value the value of the term to find
 * @param {function} onResult callback that is executed with the document that was found
 */
function findByValue(value, onResult) {
  termModel.withCollection((collection) => {
    collection.findOne({ value: value.toLowerCase() }, (error, result) => {
      if (error) {
        throw error;
      }

      onResult(result);
    });
  });
}

/**
 * Adds a term to the database.
 *
 * @param {string} value the value of the term to add
 * @param {function} onResult callback that is executed with the term document that was added
 */
function add(value, onResult) {
  termModel.withCollection((collection) => {
    collection.createIndex({ value: 1 }, { unique: true });
    collection.insertOne({ value: value.toLowerCase() }, (error, result) => {
      if (error) {
        if (error.code === 11000) {
          findByValue(value, onResult);
        } else {
          throw error;
        }
      } else {
        onResult(result.ops[0]);
      }
    });
  });
}

/**
 * Deletes a term.
 *
 * @param {string} id the id of the term to delete
 * @param {function} onResult callback that is executed with a boolean to indicate whether the
 *        delete operation was successful
 * @see Model#deleteOne
 */
function deleteById(id, onResult) {
  termModel.deleteOne(id, onResult);
}

exports.get = get;
exports.getForScorepad = getForScorepad;
exports.add = add;
exports.deleteById = deleteById;
