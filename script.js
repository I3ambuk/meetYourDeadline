document.getElementById('playerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const numPlayers = document.getElementById('numPlayers').value;
    fetch('words.json')
        .then(response => response.json())
        .then(wordPairs => {
            startGame(numPlayers, wordPairs);
        });
});

function startGame(numPlayers, wordPairs) {
    const selectedPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
    const words = Array(parseInt(numPlayers) - 1).fill(selectedPair.word1);
    words.splice(Math.floor(Math.random() * words.length), 0, selectedPair.word2);

    const buttonsContainer = document.getElementById('buttonsContainer');
    buttonsContainer.innerHTML = ''; // Clear previous buttons

    for (let i = 0; i < numPlayers; i++) {
        const playerId = i + 1;
        const word = words[i];
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player');

        const playerButton = document.createElement('button');
        playerButton.textContent = `User ${playerId}: Show Word`;
        playerButton.addEventListener('click', function() {
            const wordDisplay = playerDiv.querySelector('.wordDisplay');
            if (wordDisplay.style.display === 'none') {
                wordDisplay.style.display = 'block';
                playerButton.textContent = `User ${playerId}: Hide Word`;
            } else {
                wordDisplay.style.display = 'none';
                playerButton.textContent = `User ${playerId}: Show Word`;
            }
        });

        const wordDisplay = document.createElement('div');
        wordDisplay.classList.add('wordDisplay');
        wordDisplay.textContent = word;
        wordDisplay.style.display = 'none';

        playerDiv.appendChild(playerButton);
        playerDiv.appendChild(wordDisplay);
        buttonsContainer.appendChild(playerDiv);
    }

    document.getElementById('playerForm').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
}
