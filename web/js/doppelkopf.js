function addPlayers(select, players) {
    for (let i = 0; i < players.length; i += 1) {
        const option = document.createElement('option');
        const player = players[i];
        option.appendChild(document.createTextNode(player.name));
        select.appendChild(option);
    }
}

window.onload = function onLoad() {
    var request = new XMLHttpRequest();

    request.open('GET','/api/players');
    request.addEventListener('load', function onRequestLoad() {
        if (request.status >= 200 && request.status < 300) {
            var players = JSON.parse(request.responseText);
            addPlayers(document.getElementById('player'),players);
        } else {
           console.warn(request.statusText, request.responseText);
        }
     });
     request.send();
};