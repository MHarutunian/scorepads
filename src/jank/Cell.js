/**
 * Placeholder used in cells until their actual content is revealed.
 */
const PLACEHOLDER = '???';

/**
 * Creates a new wrapper for a cell in the JanK table.
 *
 * @param {HTMLTableCellElement} element the underlying HTML element
 * @param {string|int} value the scalar value of the cell
 */
function Cell(element, value = null) {
  this.element = element;
  this.setValue(value);
}

/**
 * Resets this cell, settings its value to `null`.
 */
Cell.prototype.reset = function () {
  this.setValue(null);
};

/**
 * Sets this cell's value, also setting the text content of the HTML element.
 *
 * If the value is `null`, this will set the text content to a placeholder instead.
 */
Cell.prototype.setValue = function (value) {
  this.value = value;
  this.element.textContent = value !== null ? value.toString() : PLACEHOLDER;
};

export default Cell;
