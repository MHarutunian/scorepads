/**
 * Helper for `<select>` elements used to select players.
 *
 * Every player can only be selected once, and an associated button will only be enabled once all players have
 * been selected. Select elements can be added or removed to this helper at will.
 *
 * @param {Array} players the list of available players
 * @param {HTMLButtonElement} actionButton the button triggering an action once all players have been selected
 */
function PlayerSelectHelper(players, actionButton) {
  this.selects = [];
  this.players = players;
  this.actionButton = actionButton;
}

/**
 * Adds a select element to this helper.
 *
 * @param {HTMLSelectElement} select the element to add
 */
PlayerSelectHelper.prototype.add = function (select) {
  this.selects = [...this.selects, select];

  this.players.forEach((player) => {
    const option = document.createElement('option');
    option.value = player._id;
    option.textContent = player.name;
    option.disabled = this.isOptionDisabled(option);
    select.appendChild(option);
  });

  const onChange = select.onchange;

  select.selectedIndex = -1;
  select.onchange = () => {
    if (typeof onChange === 'function') {
      onChange();
    }

    this.checkOptions();
  };

  this.actionButton.disabled = true;
};

/**
 * Adds all of the provided select elements to this helper.
 *
 * @param {HTMLSelectElement[]} selects the elements to add
 */
PlayerSelectHelper.prototype.addAll = function (selects) {
  selects.forEach(select => this.add(select));
};

/**
 * Removes a select element from this helper.
 *
 * The options of all other select elements will be adjusted accordingly.
 *
 * @param {HTMLSelectElement} select the element to remove
 */
PlayerSelectHelper.prototype.remove = function (select) {
  this.selects = this.selects.filter(s => s !== select);
  this.checkOptions();
};

/**
 * Checks whether an option should be disabled.
 *
 * @param {HTMLOptionElement} option the option in question
 * @returns {boolean} should the provided option be disabled?
 */
PlayerSelectHelper.prototype.isOptionDisabled = function (option) {
  return this.selects.some(s => s.value === option.value);
};

/**
 * Returns the number of select elements currently managed by this helper.
 *
 * @returns {number} the number of elements managed by this helper
 */
PlayerSelectHelper.prototype.count = function () {
  return this.selects.length;
};

/**
 * Checks all options and disables those already selected across all select elements.
 *
 * This will also disable/enable the action button, based on whether all players have been selected.
 */
PlayerSelectHelper.prototype.checkOptions = function () {
  this.selects.forEach((otherSelect) => {
    Array.from(otherSelect.options).forEach((option) => {
      if (option.parentNode.value !== option.value) {
        option.disabled = this.isOptionDisabled(option);
      }
    });

    this.actionButton.disabled = this.selects.some(s => !s.value);
  });
};

export default PlayerSelectHelper;
