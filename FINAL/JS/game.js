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

let currentScene = 0;
let typing = false;
let transitionLock = false;
let lastClickTime = 0;
let typingTimeout = null;
let script = [];

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
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }
    script = await response.json();
    console.log('Script loaded successfully:', script);
    console.log(`Script length: ${script.length}`);
  } catch (err) {
    console.error('Failed to load script.json:', err);
    alert('Failed to load game script. Please check if json/script.json exists and is valid JSON.');
    script = [];
  }
}

function playSound(soundName) {
  const sound = soundMap[soundName];
  if (sound) {
    sound.play().catch(err => console.log(`Sound ${soundName} failed:`, err));
  }
}

function applyEffect(effectType) {
  console.log(`Applying effect: ${effectType}`);
  if (effectType === 'flicker') {
    gameContainer.classList.add('flicker');
    flashOverlay.classList.add('flash-red');
    setTimeout(() => {
      gameContainer.classList.remove('flicker');
      flashOverlay.classList.remove('flash-red');
    }, 4000);
  } else if (effectType === 'flicker-bad') {
    gameContainer.classList.add('flicker-bad');
    flashOverlay.classList.add('flash-red-bad');
    setTimeout(() => {
      gameContainer.classList.remove('flicker-bad');
      flashOverlay.classList.remove('flash-red-bad');
    }, 4000);
  } else if (effectType === 'zombieAttack') {
    playSound('monster');
  } else if (effectType === 'fadeInGhost' || effectType === 'fadeInGhostAndSurvivor') {
    playSound('whisper');
  }
}

function typeText(text, callback) {
  dialogueText.textContent = '';
  let i = 0;
  typing = true;
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  function type() {
    if (i < text.length) {
      dialogueText.textContent += text.charAt(i);
      i++;
      typingTimeout = setTimeout(type, 30);
    } else {
      typing = false;
      typingTimeout = null;
      continueHint.style.opacity = 1;
      if (callback) callback();
    }
  }
  type();
}

function showChoices(choices) {
  choicesDiv.innerHTML = '';
  if (choices && Array.isArray(choices)) {
    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.text;
      btn.onclick = () => {
        console.log(`Choice clicked: ${choice.text}, next scene: ${choice.next}`);
        loadScene(choice.next);
      };
      choicesDiv.appendChild(btn);
    });
  }
}

function fadeOut(callback, isGameOver = false) {
  transitionLock = true;
  gameContainer.style.opacity = 0;
  setTimeout(() => {
    callback();
    transitionLock = false;
  }, isGameOver ? 5000 : 1000);
}

function fadeIn() {
  gameContainer.style.opacity = 1;
}

function debounceClick(handler) {
  return function (event) {
    const now = Date.now();
    if (now - lastClickTime < 100) {
      console.log('Click ignored due to debounce');
      return;
    }
    lastClickTime = now;
    handler(event);
  };
}

function loadScene(sceneIndex) {
  console.log(`Loading scene: ${sceneIndex}`);
  if (!script || script.length === 0) {
    console.error('Script is empty or not loaded. Cannot load scene:', sceneIndex);
    return;
  }
  if (sceneIndex < 0 || sceneIndex >= script.length) {
    console.error('Invalid scene index:', sceneIndex, 'Script length:', script.length);
    return;
  }
  const scene = script[sceneIndex];
  if (!scene) {
    console.error('Scene is undefined at index:', sceneIndex);
    return;
  }
  currentScene = sceneIndex;
  continueHint.style.opacity = 0;

  fadeOut(() => {
    try {
      console.log(`Setting background: ${scene.background}`);
      gameContainer.style.backgroundImage = `url(${scene.background})`;
    } catch (err) {
      console.warn(`Failed to load background image: ${scene.background}`, err);
    }

    choicesDiv.innerHTML = '';
    typeText(scene.speaker ? `${scene.speaker}: ${scene.text}` : scene.text, () => {
      if (scene.isGoodEnding !== undefined && scene.next === null) {
        setTimeout(showGameOver, 3000);
      }
    });

    if (scene.effect) {
      applyEffect(scene.effect);
    }

    if (scene.sounds) {
      scene.sounds.forEach(playSound);
    }

    if (scene.choices) {
      dialogueBox.onclick = null;
      setTimeout(() => {
        showChoices(scene.choices);
        dialogueBox.onclick = debounceClick(() => {
          console.log('Dialogue box clicked, but choices are active');
        });
      }, 800);
    } else {
      dialogueBox.onclick = debounceClick(() => {
        if (typing || transitionLock) {
          console.log('Click ignored: typing or transitioning');
          return;
        }
        if (scene.next !== undefined) {
          loadScene(scene.next);
        }
      });
    }

    fadeIn();
  }, false);
}

function showGameOver() {
  if (!script || script.length === 0 || !script[currentScene]) {
    console.error('Cannot show game over: script is empty or current scene is undefined');
    return;
  }
  const scene = script[currentScene];
  console.log(`Showing game over, isGoodEnding: ${scene.isGoodEnding}`);
  if (scene.isGoodEnding) {
    bgMusic.pause();
    victorySound.play().catch(err => console.log('Victory sound blocked:', err));
  } else {
    bgMusic.pause();
    badEndingSound.play().catch(err => console.log('Bad ending sound blocked:', err));
  }
  gameContainer.style.transition = 'opacity 5s ease';
  fadeOut(() => {
    gameContainer.style.display = 'none';
    gameOverScreen.style.display = 'flex';
    gameContainer.style.transition = 'opacity 1s ease';
  }, true);
}

function startGame() {
  if (script.length === 0) {
    console.error('Cannot start game: script is empty');
    alert('Cannot start game: script is not loaded. Please check json/script.json.');
    return;
  }
  loadScene(0);
}

// Initialize
startButton.onclick = async () => {
  await loadScript();
  if (script.length === 0) {
    console.error('Game cannot start: script failed to load');
    alert('Game cannot start: script failed to load. Please check json/script.json.');
    return;
  }
  titleScreen.style.display = 'none';
  gameContainer.style.display = 'flex';
  bgMusic.play().catch(err => console.log('Music blocked:', err));
  startGame();
};

resetButton.onclick = () => {
  victorySound.pause();
  badEndingSound.pause();
  victorySound.currentTime = 0;
  badEndingSound.currentTime = 0;
  bgMusic.play().catch(err => console.log('Music blocked:', err));
  gameOverScreen.style.display = 'none';
  gameContainer.style.display = 'flex';
  gameContainer.style.transition = 'opacity 1s ease';
  gameContainer.style.opacity = 1;
  currentScene = 0;
  startGame();
};
