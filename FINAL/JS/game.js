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
  'victory-sound': victorySound,
  'bad-ending': badEndingSound
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

async function preloadImages() {
  const imagePromises = script
    .filter(scene => scene.background)
    .map(scene => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = scene.background;
        img.onload = resolve;
        img.onerror = () => {
          console.warn(`Failed to preload image: ${scene.background}`);
          resolve(); // Continue even if an image fails
        };
      });
    });
  await Promise.all(imagePromises);
  console.log('All background images preloaded');
}

function playSound(soundName) {
  const sound = soundMap[soundName];
  if (sound) {
    sound.play().catch(err => console.log(`Sound ${soundName} failed:`, err));
  } else {
    console.warn(`Sound ${soundName} not found in soundMap`);
  }
}

function stopAllSounds() {
  console.log('Stopping all sounds');
  Object.values(soundMap).forEach(sound => {
    if (sound) {
      console.log(`Stopping ${sound.id}`);
      sound.pause();
      sound.currentTime = 0;
    }
  });
  if (bgMusic) {
    console.log('Stopping bgMusic');
    bgMusic.pause();
    bgMusic.currentTime = 0;
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
  } else if (effectType === 'fadeInGhost' || effectType === 'fadeInGhostAndSurvivor' || effectType === 'fadeInSurvivor') {
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
      dialogueBox.onclick = null; // Clear temporary handler
      if (callback) callback();
    }
  }
  type();
  // Temporary handler to skip typing
  dialogueBox.onclick = debounceClick(() => {
    if (typing) {
      clearTimeout(typingTimeout);
      dialogueText.textContent = text;
      typing = false;
      typingTimeout = null;
      continueHint.style.opacity = 1;
      dialogueBox.onclick = null; // Clear handler
      if (callback) callback();
    }
  });
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
  console.log('Fade out started');
  const startTime = performance.now();
  gameContainer.style.opacity = 0;
  setTimeout(() => {
    console.log(`Fade out completed in ${performance.now() - startTime}ms`);
    callback();
    transitionLock = false;
  }, 1000);
}

function fadeIn() {
  gameContainer.style.opacity = 1;
}

function debounceClick(handler) {
  return function(event) {
    const now = Date.now();
    if (now - lastClickTime < 100) {
      console.log('Click ignored due to debounce');
      return;
    }
    lastClickTime = now;
    console.log('Click detected, currentScene:', currentScene, 'typing:', typing, 'transitionLock:', transitionLock);
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
  dialogueBox.onclick = null; // Clear any existing handler

  fadeOut(() => {
    try {
      console.log(`Setting background: ${scene.background}`);
      document.getElementById('background-layer').style.backgroundImage = `url(${scene.background})`;
    } catch (err) {
      console.warn(`Failed to load background image: ${scene.background}`, err);
    }

    choicesDiv.innerHTML = '';
    typeText(scene.speaker ? `${scene.speaker}: ${scene.text}` : scene.text, () => {
      if (scene.isGoodEnding !== undefined && scene.next === null) {
        setTimeout(showGameOver, 3000);
      } else if (scene.choices) {
        showChoices(scene.choices);
        dialogueBox.onclick = debounceClick(() => {
          console.log('Dialogue box clicked, but choices are active');
        });
      } else if (scene.next !== undefined) {
        dialogueBox.onclick = debounceClick(() => {
          if (!typing && !transitionLock) {
            console.log(`Advancing to scene: ${scene.next}`);
            loadScene(scene.next);
          } else {
            console.log('Click ignored: typing=', typing, 'transitionLock=', transitionLock);
          }
        });
      }
    });

    if (scene.effect) {
      applyEffect(scene.effect);
    }

    if (scene.sounds) {
      scene.sounds.forEach(playSound);
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
  stopAllSounds(); // Stop all sounds before playing ending sound
  if (scene.isGoodEnding) {
    victorySound.play().catch(err => console.log('Victory sound blocked:', err));
  } else {
    badEndingSound.play().catch(err => console.log('Bad ending sound blocked:', err));
  }
  fadeOut(() => {
    gameContainer.style.display = 'none';
    gameOverScreen.style.display = 'flex';
  }, true);
}

function startGame() {
  if (script.length === 0) {
    console.error('Cannot start game: script is empty');
    alert('Cannot start game: script is not loaded. Please check json/script.json.');
    return;
  }
  stopAllSounds(); // Ensure no sounds are playing
  bgMusic.play().catch(err => console.log('Music blocked:', err));
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
  await preloadImages();
  titleScreen.style.display = 'none';
  gameContainer.style.display = 'flex';
  startGame();
};

resetButton.onclick = () => {
  console.log('Resetting game, clearing background');
  stopAllSounds(); // Stop all sounds before resetting
  document.getElementById('background-layer').style.backgroundImage = ''; // Clear background
  gameOverScreen.style.display = 'none';
  gameContainer.style.display = 'flex';
  currentScene = 0;
  typing = false;
  transitionLock = false;
  startGame();
};