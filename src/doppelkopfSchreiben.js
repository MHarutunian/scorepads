import sendRequest from './utils/sendRequest';

/**
 * Retrieves a single query parameter by its key.
 *
 * @param {string} key the key of the query parameter to get
 * @return {string} the query parameter for the specified key or `null` if the
 *         parameter doesn't exist
 */
function getParam(key) {
  const query = window.location.search;
  const keyIndex = query.indexOf(key);

  if (keyIndex < 0) {
    return null;
  }

  const startIndex = query.indexOf('=', keyIndex) + 1;
  const endIndex = query.indexOf('&', keyIndex);

  if (endIndex < startIndex) {
    return query.substring(startIndex);
  }

  return query.substring(startIndex, endIndex);
}

window.onload = () => {
  const scorepadId = getParam('scorepad');
  sendRequest('GET', `/api/scorepads/${scorepadId}`, (scorepad) => {
    const { players } = scorepad;
    for (let i = 1; i < 5; i += 1) {
      const playerText = document.createTextNode(players[i - 1].name);
      document.getElementById(`playerSel${i}`).appendChild(playerText);
    }
  });
};
