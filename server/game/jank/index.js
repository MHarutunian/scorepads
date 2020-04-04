const { JOKER_TERM } = require('./constants');

/**
 * Checks whether the provided bet is the same bet as the two provided player IDs.
 *
 * @param {Array} bet the bet in question
 * @param {string} playerA the first player of the bet
 * @param {string} playerB the second player of the bet
 * @returns {function} function that checks whether a bet is the same bet as `[playerA, playerB]`
 */
function isSameBet(playerA, playerB) {
  return (bet) => bet.every((p) => p === playerA || p === playerB);
}

/**
 * Gets only unique bets for each player, returned as map from player ID to unique bets.
 *
 * @param {Array} rounds the rounds that have been played in the game
 */
function getUniqueBets(rounds) {
  const result = {};
  rounds.forEach(({ bets }) => {
    Object.keys(bets).forEach((playerId) => {
      const bet = bets[playerId];
      const existingBets = result[playerId] || [];

      const [playerA, playerB] = bet;
      const hasSameBet = existingBets.some(isSameBet(playerA, playerB));

      if (!hasSameBet) {
        result[playerId] = [...existingBets, bet];
      }
    });
  });

  return result;
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

  const betMap = getUniqueBets(rounds);

  Object.keys(betMap).forEach((playerId) => {
    const hasPartnerBet = (partner) => betMap[partner].some(isSameBet(playerId, partner));

    betMap[playerId].forEach(([playerA, playerB]) => {
      if (playerA === playerB) {
        // invalid bet
        return;
      }

      let score = 0;
      const termA = terms[playerA].value;
      const termB = terms[playerB].value;

      // if the player bets on a joker, he has to pay
      if (termA === JOKER_TERM) {
        score -= 1;
        scoreMap[playerA] += 1;
      }

      if (termB === JOKER_TERM) {
        score -= 1;
        scoreMap[playerB] += 1;
      } else if (termA === termB) {
        // correct bet - we need to check if the player was trying to find his/her partner
        if (playerA === playerId) {
          if (hasPartnerBet(playerB)) {
            score += 5;
          }
        } else if (playerB === playerId) {
          if (hasPartnerBet(playerA)) {
            score += 5;
          }
        } else {
          // player didn't bet on himself, so he bet correctly on another team
          score += 2;
          scoreMap[playerA] -= 1;
          scoreMap[playerB] -= 1;
        }
      }

      scoreMap[playerId] += score;
    });
  });

  return scoreMap;
}

module.exports = calculateScore;
