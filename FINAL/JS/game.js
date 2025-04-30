const titleScreen = document.getElementById('title-screen');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');
const flashOverlay = document.getElementById('flash-overlay');
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const choicesDiv = document.getElementById('choices');
const continueHint = document.getElementById('continue-hint');
const bgMusic = document.getElementById('bg-music');
const creakSound = document.getElementById('creak-sound');
const whisperSound = document.getElementById('whisper-sound');
const monsterSound = document.getElementById('monster-sound');
const screamSound = document.getElementById('scream-sound');
const fightSound = document.getElementById('fight-sound');
const escapeSound = document.getElementById('escape-sound');
const victorySound = document.getElementById('victory-sound');
const badEndingSound = document.getElementById('bad-ending-sound');
const gameOverScreen = document.getElementById('game-over-screen');
const resetButton = document.getElementById('reset-button');

let script = [];
let currentScene = 0;
let typing = false;
let typingTimeout = null;
let transitionLock = false;
let lastClickTime = 0;

const soundMap = {
  creak: creakSound,
  whisper: whisperSound,
  monster: monsterSound,
  scream: screamSound,
  fight: fightSound,
  escape: escapeSound,
  victory: victorySound,
  badEnding: badEndingSound
};

async function loadScript() {
  try {
    const response = await fetch('json/script.json?' + new Date().getTime());
    script = await response.json();
  } catch (err) {
    alert("Script failed to load. Please check your file paths.");
  }
}

function preloadImages() {
  script.forEach(scene => {
    if (scene.background) {
      const img = new Image();
      img.src = scene.background;
    }
  });
}

function playSound(name) {
  const s = soundMap[name];
  if (s) s.play().catch(() => {});
}

function applyEffect(effect) {
  if (effect === 'flicker') {
    gameContainer.classList.add('flicker');
    flashOverlay.classList.add('flash-red');
    setTimeout(() => {
      gameContainer.classList.remove('flicker');
      flashOverlay.classList.remove('flash-red');
    }, 3000);
  } else if (effect === 'flicker-bad') {
    gameContainer.classList.add('flicker-bad');
    flashOverlay.classList.add('flash-red-bad');
    setTimeout(() => {
      gameContainer.classList.remove('flicker-bad');
      flashOverlay.classList.remove('flash-red-bad');
    }, 3000);
  } else if (effect === 'zombieAttack') {
    playSound('monster');
  } else if (effect === 'fadeInGhost' || effect === 'fadeInGhostAndSurvivor') {
    playSound('whisper');
  }
}

function typeText(text, callback) {
  dialogueText.textContent = '';
  let i = 0;
  typing = true;
  if (typingTimeout) clearTimeout(typingTimeout);
  function type() {
    if (i < text.length) {
      dialogueText.textContent += text.charAt(i++);
      typingTimeout = setTimeout(type, 30);
    } else {
      typing = false;
      continueHint.style.opacity = 1;
      if (callback) callback();
    }
  }
  type();
}

function showChoices(choices) {
  choicesDiv.innerHTML = '';
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choice.text;
    btn.onclick = () => loadScene(choice.next);
    choicesDiv.appendChild(btn);
  });
}

function debounceClick(fn) {
  return function(event) {
    const now = Date.now();
    if (now - lastClickTime < 150) return;
    lastClickTime = now;
    fn(event);
  };
}

function fadeOut(callback, isGameOver = false) {
  transitionLock = true;
  gameContainer.style.transition = 'opacity 1s ease';
  gameContainer.style.opacity = 0;
  gameContainer.style.pointerEvents = 'none';
  setTimeout(() => {
    callback();
    transitionLock = false;
  }, isGameOver ? 5000 : 1000);
}

function fadeIn() {
  gameContainer.style.opacity = 1;
  gameContainer.style.pointerEvents = 'auto';
}

function loadScene(index) {
  if (!script[index]) return;
  const scene = script[index];
  currentScene = index;
  continueHint.style.opacity = 0;

  fadeOut(() => {
    if (scene.background) {
      gameContainer.style.backgroundImage = `url(${scene.background})`;
    }

    dialogueText.textContent = '';
    choicesDiv.innerHTML = '';
    typeText(scene.speaker ? `${scene.speaker}: ${scene.text}` : scene.text, () => {
      if (scene.isGoodEnding !== undefined && scene.next === null) {
        setTimeout(showGameOver, 2000);
      }
    });

    if (scene.effect) applyEffect(scene.effect);
    if (scene.sounds) scene.sounds.forEach(playSound);

    if (scene.choices) {
      dialogueBox.onclick = null;
      setTimeout(() => {
        showChoices(scene.choices);
        dialogueBox.onclick = debounceClick(() => {});
      }, 600);
    } else {
      dialogueBox.onclick = debounceClick(() => {
        if (typing || transitionLock) return;
        if (scene.next !== undefined) loadScene(scene.next);
      });
    }

    fadeIn();
  });
}

function showGameOver() {
  const scene = script[currentScene];
  if (scene.isGoodEnding) {
    bgMusic.pause();
    victorySound.play();
  } else {
    bgMusic.pause();
    badEndingSound.play();
  }

  fadeOut(() => {
    gameContainer.style.opacity = 0;
    gameOverScreen.style.display = 'flex';
  }, true);
}

function startGame() {
  if (script.length === 0) {
    alert("Script not loaded.");
    return;
  }
  loadScene(0);
}

startButton.onclick = async () => {
  await loadScript();
  preloadImages();
  titleScreen.style.display = 'none';
  gameContainer.style.opacity = 0;
  gameContainer.style.pointerEvents = 'auto';
  bgMusic.play().catch(() => {});
  startGame();
};

resetButton.onclick = () => {
  victorySound.pause(); victorySound.currentTime = 0;
  badEndingSound.pause(); badEndingSound.currentTime = 0;
  gameOverScreen.style.display = 'none';
  gameContainer.style.opacity = 1;
  bgMusic.play().catch(() => {});
  startGame();
};
