function addPlayers(select, players) {
  for (let i = 0; i < players.length; i += 1) {
    const option = document.createElement('option');
    const player = players[i];
    option.appendChild(document.createTextNode(player.name));
    select.appendChild(option);
  }
  for (let i = 1; i < 5; i += 1) { // Vorauswahl auf empty setzen
    document.getElementById(`player${i}`).selectedIndex = -1;
  }
}

window.onload = function onLoad() {
  const request = new XMLHttpRequest();

  request.open('GET', '/api/players');
  request.addEventListener('load', function onRequestLoad() {
    for (let i = 1; i < 5; i += 1) { // 4 Spieler können ausgewählt werden
      if (request.status >= 200 && request.status < 300) {
        const players = JSON.parse(request.responseText);
        addPlayers(document.getElementById(`player${i}`), players);
      } else {
        console.warn(request.statusText, request.responseText);
      }
    }
  });
  request.send();
};

document.addEventListener('DOMContentLoaded', function storeChoice() { // Auswahl des Spielers wird gespeichert
  for (let i = 1; i < 5; i += 1) {
    const input = document.getElementById(`player${i}`);
    if (localStorage[`player${i}`]) {
      input.value = localStorage[`player${i}`];
    }
    input.onchange = function storeChange() {
      localStorage[`player${i}`] = this.value;
    };
  }
});

function writeNames() { // Schreibe Spieler in Tabelle(innerHTML, wegen Mangel an alternativ Wissen)
  for (let i = 1; i < 5; i += 1) {
    document.getElementById(`spieler${i}`).innerHTML = localStorage[`player${i}`];
  }
}
