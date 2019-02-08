const { JOKER_TERM } = require('./constants');

/**
 * Checks whether a player's partner has bet on the partner correctly within a match.
 *
 * @param {Array} rounds the list of all rounds that were played in a single match
 * @param {string} playerId the ID of the player
 * @param {string} partnerId the ID of the player's partner
 */
function hasPartnerBet(rounds, playerId, partnerId) {
  return rounds.some(({ bets }) => {
    const bet = bets[partnerId];
    return bet.every(p => p === playerId || p === partnerId);
  });
}

/**
 * Calculates the score for a JanK match.
 *
 * @param {Object} match the match to calculate the score for
 */
function calculateScore({ terms, rounds }) {
  const scoreMap = {};

  Object.keys(terms).forEach((playerId) => {
    scoreMap[playerId] = 0;
  });

  rounds.forEach(({ bets }) => {
    Object.keys(bets).forEach((playerId) => {
      const [playerA, playerB] = bets[playerId];

      if (playerA === playerB) {
        // invalid bet
        return;
      }

      let score = scoreMap[playerId];
      const termA = terms[playerA];
      const termB = terms[playerB];

      // if the player bets on a joker, he has to pay
      if (termA === JOKER_TERM) {
        score -= 1;
      }

      if (termB === JOKER_TERM) {
        score -= 1;
      } else if (termA === termB) {
        // correct bet - we need to check if the player was trying to find his/her partner
        if (playerA === playerId) {
          if (hasPartnerBet(rounds, playerId, playerB)) {
            score += 5;
          }
        } else if (playerB === playerId) {
          if (hasPartnerBet(rounds, playerId, playerA)) {
            score += 5;
          }
        } else {
          // player didn't bet on himself, so he bet correctly on another team
          score += 2;
          scoreMap[playerA] -= 1;
          scoreMap[playerB] -= 1;
        }
      }

      scoreMap[playerId] = score;
    });
  });

  return scoreMap;
}

module.exports = calculateScore;
