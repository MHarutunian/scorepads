/**
 * Initializes a list of player selects by adding the players as options.
 *
 * In addition, an onchange handler is added to each select that disables already selected
 * options and only enables the action button if all players have been selected.
 *
 * @param {HTMLSelectElement[]} selects the list of select elements to initialize
 * @param {Object[]} players the players to add as select options
 * @param {HTMLButtonCollection} actionButton the button used to confirm the player selection
 */
function initPlayerSelects(selects, players, actionButton) {
  /* eslint-disable no-param-reassign */
  selects.forEach((select) => {
    players.forEach((player) => {
      const option = document.createElement('option');
      option.value = player._id;
      option.textContent = player.name;
      select.appendChild(option);
    });

    select.selectedIndex = -1;
    select.onchange = () => {
      selects.forEach((otherSelect) => {
        if (otherSelect !== select) {
          Array.from(otherSelect.options).forEach((option) => {
            if (option.parentNode.value !== option.value) {
              option.disabled = selects.some(s => s.value === option.value);
            }
          });
        }

        actionButton.disabled = selects.some(s => !s.value);
      });
    };
  });
}

export default initPlayerSelects;
