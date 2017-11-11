window.onload = () => { // Schreibe Spieler in Tabelle(innerHTML, wegen Mangel an alternativ Wissen)
  for (let i = 1; i < 5; i += 1) {
    const playerText = document.createTextNode(localStorage[`player${i}`]);
    document.getElementById(`playerSel${i}`).appendChild(playerText);
  }
};
