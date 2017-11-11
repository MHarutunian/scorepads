function addPlayers(select, players) {
  for (let i = 0; i < players.length; i += 1) {
    const option = document.createElement('option');
    const player = players[i];
    option.appendChild(document.createTextNode(player.name));
    select.appendChild(option);
  }
}

function initSelect() {
  const request = new XMLHttpRequest();

  request.open('GET', '/api/players');
  request.addEventListener('load', () => {
    // 4 Spieler können ausgewählt werden
    if (request.status >= 200 && request.status < 300) {
      for (let i = 1; i < 5; i += 1) {
        const players = JSON.parse(request.responseText);
        const playerSelect = document.getElementById(`player${i}`);
        addPlayers(playerSelect, players);
        if (localStorage[`player${i}`]) {
          const index = players.findIndex(player => player.name === localStorage[`player${i}`]);
          playerSelect.selectedIndex = index;
        }
      }
    } else {
      console.warn(request.statusText, request.responseText);
    }
  });
  request.send();
}

window.onload = () => {
  initSelect();

  for (let i = 1; i < 5; i += 1) { // Auswahl des Spielers wird gespeichert
    const input = document.getElementById(`player${i}`);
    input.onchange = (event) => {
      localStorage[`player${i}`] = event.target.value;
    };
  }

  document.getElementById('begin').onclick = () => {
    window.location.href = 'doppelkopfSchreiben.html';
  };
};
