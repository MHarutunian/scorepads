/**
 * Adds a list of players as select options to an HTML select element.
 *
 * @param {HTMLSelectElement} select the select element
 * @param {Object[]} players the players to add as select options
 */
function addPlayers(select, players) {
  for (let i = 0; i < players.length; i += 1) {
    const option = document.createElement('option');
    const player = players[i];
    option.value = player._id;
    option.textContent = player.name;
    select.appendChild(option);
  }
}

export default addPlayers;
