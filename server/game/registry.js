const doppelkopf = require('./doppelkopf');

/**
 * Registry of available games.
 */
const registry = {};

/**
 * Adds a 'scorepads' game to the registry.
 *
 * @param {string} name the name of the game to register
 * @param {function} calculateScore callback used to calculate the score for
 *                   the game's matches
 */
function registerGame(name, calculateScore) {
  registry[name] = calculateScore;
}

/**
 * Calculates the score for a match of the specified game.
 *
 * @param {string} game the name of the game to calculate the score for
 * @param {Object} match the match used to calculate the score
 * @throws {Error} if the specified game has not been registered
 */
function calculateMatchScore(game, match) {
  if (game in registry) {
    return registry[game](match);
  }

  throw new Error(`Unknown game: ${game}`);
}

registerGame('Doppelkopf', doppelkopf);

exports.calculateMatchScore = calculateMatchScore;
