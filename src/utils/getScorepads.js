import sendRequest from '../utils/sendRequest'
import getPictureSrc from '../utils/getPictureSrc';


/**
 * Creates a player as an HTML element.
 *
 * @param {Object} player the player to create the HTML element from
 * @return {HTMLSpanElement} the HTML element representing the player
 */
function createPlayerElement(player) {
    const playerElement = document.createElement('span');
    playerElement.className = 'player';
  
    const picture = document.createElement('img');
    picture.className = 'player-picture';
    picture.src = getPictureSrc(player && player.picture);
    playerElement.appendChild(picture);
  
    const name = player ? player.name : 'Undefined';
    playerElement.appendChild(document.createTextNode(name));
    return playerElement;
  }
  
  /**
 * Creates a scorepad as an HTML list item.
 *
 * @param {Object} scorepad the scorepad to create the HTML element from
 * @param {Object} gameName the game to choose from scorepadLists
 * @param {Object} onLoad 
 * @return {HTMLLIElement} the HTML list item representing the scorepad
 */
  function createScorepadElement(scorepad, gameName, onLoad) {
    const listItem = document.createElement('li');
    listItem.className = 'scorepad';
  
    const game = document.createElement('span');
    game.className = 'game';
    game.appendChild(document.createTextNode(scorepad.game));
    listItem.appendChild(game);
  
    scorepad.players.forEach((player) => {
      listItem.appendChild(createPlayerElement(player));
    });
    const date = new Date(scorepad.created_at);
    const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    listItem.appendChild(document.createTextNode(formattedDate));
  
    // on click methode uebergeben als drittes parameter 
    const loadButton = document.createElement('button');
    loadButton.type = 'button';
    loadButton.onclick = () => {
        onLoad(scorepad); 
      }
    
    loadButton.appendChild(document.createTextNode('Spiel laden'));
    listItem.appendChild(loadButton);
  
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.onclick = () => {
      sendRequest('DELETE', `/api/scorepads/${scorepad._id}`, () => {
        scorepadList.removeChild(listItem);
      });
    };
    deleteButton.textContent = 'Spiel löschen';
    listItem.appendChild(deleteButton);
  
    return listItem;
  };



  export default function getScorepads(game, scorepadList, onLoad) {
    sendRequest('GET', `/api/scorepads/?game=${game}`, (scorepads) => {
        scorepads.forEach((scorepad) => {
        scorepadList.appendChild(createScorepadElement(scorepad, game, onLoad));
        });
    })
  }