function addPlayers(select, players) {
    for (var i = 0; i < players.length; i++) {
        var option = document.createElement('option');
        var player = players[i];
        option.appendChild(document.createTextNode(player.name));
        select.appendChild(option);
    }
}

window.onload = function() {
    var request = new XMLHttpRequest();

    request.open('GET','/api/players');
    request.addEventListener('load',function(event) {
        if (request.status >= 200 && request.status < 300) {
            var players = JSON.parse(request.responseText);
            addPlayers(document.getElementById('player'),players);
        } else {
           console.warn(request.statusText, request.responseText);
        }
     });
     request.send();
};