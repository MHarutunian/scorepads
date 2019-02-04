import sendRequest from '../utils/sendRequest';
import '../css/common.css';
import '../css/jank/terms.css';

/**
 * The URL to the API of the terms collection.
 */
const API_URL = '/api/jank/terms';

/**
 * The list of term IDs already added to the page.
 */
const termIds = [];

/**
 * Adds a term to the list of terms displayed to the user.
 *
 * @param {Object} term the term to add to the list of terms
 */
function addTerm(term) {
  if (termIds.find(id => id === term._id)) {
    // duplicate term was added already, ignore this one
    return;
  }

  termIds.push(term._id);

  const termList = document.getElementById('term-list');
  const termItem = document.createElement('li');
  termItem.className = 'term-item';
  termItem.textContent = term.value;

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'term-delete';
  deleteButton.textContent = 'X';
  deleteButton.onclick = () => sendRequest('DELETE', `${API_URL}/${term._id}`, () => {
    termList.removeChild(termItem);
  });
  termItem.appendChild(deleteButton);

  termList.appendChild(termItem);
}

window.onload = () => {
  const form = document.getElementById('term-form');
  form.onsubmit = (e) => {
    e.preventDefault();

    const { value } = form.term;

    if (!value) {
      return;
    }

    form.term.value = '';
    sendRequest('POST', API_URL, addTerm, { value });
  };

  sendRequest('GET', API_URL, (terms) => {
    terms.forEach(addTerm);
  });
};
