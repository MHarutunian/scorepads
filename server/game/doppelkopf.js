/**
 * Maximum number of points the enemy could have gotten.
 */
const maxPoints = 120;

/**
 * Number of points for each score step.
 */
const steps = 30;

/**
 * Calculates the score from the specified number of points.
 *
 * @param {int} points number of points to get the score for
 */
function getScoreFromPoints(points) {
  return Math.floor((maxPoints - points) / steps);
}

/**
 * Calculates the score for a Doppelkopf match.
 *
 * @param {Object} match the match to calculate the score for
 */
function calculateScore(match) {
  const isSolo = match.winners.some((winnerId) => winnerId === 'SOLO');
  let score = 0;
  // Initial score is 1 if playing "gegen die Alten" and the game is not a solo
  if (!isSolo) {
    score = match.team === 'kontra' ? 1 : 0;
  }


  score += getScoreFromPoints(match.points) + 1;
  score += getScoreFromPoints(match.bidding);
  score *= 2 ** match.bids.length;
  score += match.specialPoints;

  return score;
}

module.exports = calculateScore;
