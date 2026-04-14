let currentPlayerName = null;
function getPlayers() {
  return JSON.parse(localStorage.getItem("players") || "{}");
}
function savePlayers(players) {
  localStorage.setItem("players", JSON.stringify(players));
}
let gameStarted = false;

const gameUI = document.getElementById('gameUI');
const scoreEl = document.getElementById('score');
const playTip = document.getElementById('play-tip');

const namePopup = document.getElementById("name-popup");
const nameInput = document.getElementById("playerNameInput");
const nameNextBtn = document.getElementById("nameNextBtn");
const nameWarning = document.getElementById("name-warning");



window.addEventListener("load", () => {
  namePopup.style.display = "flex";
});

window.addEventListener('show-play-tip', showPlayTip);
window.addEventListener('hide-play-tip', hidePlayTip);

document.addEventListener('pointerdown', hidePlayTip);

nameNextBtn.onclick = () => {

  const name = nameInput.value.trim();
  if (!name) {
    nameWarning.textContent = "Please enter your name";
    return;
  }

  if (window.dataManager) {
    window.dataManager.setPlayerName(name);
  }

  const players = getPlayers();

  if (!players[name]) {
    players[name] = {
      games: [],
      lastGame: {
        score: 0
      }
    };
    savePlayers(players);
  }

  currentPlayerName = name;
  const lastGame = players[name].lastGame || { score: 0 };
  updateScore(lastGame.score || 0);

  // Notify threeScene.js to update score variable
  window.dispatchEvent(new Event("player-resume"));
  namePopup.style.display = "none";
  gameUI.style.display = 'block';
  gameStarted = true;

  // Start the scene
  window.dispatchEvent(new Event('game-started'));
  showPlayTip();
};

function showPlayTip() {
  if (playTip) {
    playTip.classList.remove('hidden');
  }
}

function hidePlayTip() {
  if (playTip) {
    playTip.classList.add('hidden');
  }
}


// helpers
export function isGameStarted() {
  return gameStarted;
}

export function updateScore(score) {
  scoreEl.textContent = `${score}`;
}

// buttons

// SIX POPUP
export function showSixPopup() {
  const sixPopup = document.getElementById("sixPopup");

  sixPopup.classList.remove("hidden");

  setTimeout(() => {
    sixPopup.classList.add("hidden");
  }, 1200);
}


// OUT POPUP
export function showOutPopup() {
  const outPopup = document.getElementById("outPopup");
  const replayBtn = document.getElementById("out-replay-btn");

  gameStarted = false;

  outPopup.classList.remove("hidden");

  replayBtn.onclick = () => {
    outPopup.classList.add("hidden");

    updateScore(0);

    if (currentPlayerName) {
      let players = getPlayers();
      if (players[currentPlayerName]?.lastGame) {
        players[currentPlayerName].lastGame.score = 0;
        savePlayers(players);
      }
    }

    gameStarted = true;

    window.dispatchEvent(new Event("reset-game"));
  };
}

export function getCurrentScore() {
  if (!currentPlayerName) return 0;

  const players = getPlayers();
  return players[currentPlayerName]?.lastGame?.score || 0;
}
// FOUR POPUP
export function showFourPopup() {
  const fourPopup = document.getElementById("fourPopup");
  fourPopup.classList.remove("hidden");
  setTimeout(() => {
    fourPopup.classList.add("hidden");
  }, 1200);
}
