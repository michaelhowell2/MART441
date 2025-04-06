import { GameObject } from './gameObject.js';
import { PacMan } from './pacman.js';

// Game setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('startButton');
const scoreContainer = document.getElementById('scoreDisplay');
let ghostsEaten = 0;
const WIN_SCORE = 25;

// Audio setup
const introSound = document.getElementById('introSound');
const backgroundMusic = document.getElementById('backgroundMusic');
const screamSound = document.getElementById('screamSound');
const chompSound = document.getElementById('chompSound');
introSound.volume = 0.7;
backgroundMusic.volume = 0.5;
screamSound.volume = 0.7;
chompSound.volume = 0.3;

// Create Evil Pac-Man
const pacman = new PacMan(50, 50, 20, 4);

// Arrays for objects
let obstacles = [];
let ghosts = [];
let originalGhosts = [];

// Load JSON files 
fetch('json/objectsVirus.json')
    .then(response => response.json())
    .then(data => {
        obstacles = data.map(obj => new GameObject(obj.id, obj.x, obj.y, 25));
    });

fetch('json/collectiblesGhosts.json')
    .then(response => response.json())
    .then(data => {
        originalGhosts = data.slice(0, 4);
        ghosts = originalGhosts.map(obj => new GameObject(obj.id, obj.x, obj.y, 15, obj.value));
    });

// Movement controls
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    pacman.setDirection(e.key);
});
window.addEventListener('keyup', (e) => keys[e.key] = false);

function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.radius + obj2.radius);
}

function movePacman() {
    if (ghostsEaten >= WIN_SCORE) return;

    let newX = pacman.x;
    let newY = pacman.y;

    if (keys['ArrowUp']) newY -= pacman.speed;
    if (keys['ArrowDown']) newY += pacman.speed;
    if (keys['ArrowLeft']) newX -= pacman.speed;
    if (keys['ArrowRight']) newX += pacman.speed;

    newX = Math.max(pacman.radius, Math.min(newX, canvas.width - pacman.radius));
    newY = Math.max(pacman.radius, Math.min(newY, canvas.height - pacman.radius));

    const tempPacman = { ...pacman, x: newX, y: newY };
    let canMove = true;
    for (let obstacle of obstacles) {
        if (checkCollision(tempPacman, obstacle)) {
            canMove = false;
            break;
        }
    }

    if (canMove) {
        pacman.x = newX;
        pacman.y = newY;
    }

    ghosts = ghosts.filter(ghost => {
        if (checkCollision(pacman, ghost)) {
            ghostsEaten += ghost.value;
            scoreDisplay.textContent = ghostsEaten;
            screamSound.currentTime = 0;
            screamSound.play();
            return false;
        }
        return true;
    });

    if (ghosts.length === 0 && ghostsEaten < WIN_SCORE) {
        ghosts = originalGhosts.map(obj => new GameObject(obj.id, obj.x, obj.y, 15, obj.value));
    }

    pacman.updateMouth();
}

function moveGhosts() {
    if (ghostsEaten >= WIN_SCORE) return;

    ghosts.forEach(ghost => {
        ghost.moveRandomly(canvas.width, canvas.height, obstacles);
    });
}

function draw() {
    ctx.fillStyle = '#666666';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#4A0000';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, 0);
        ctx.lineTo(Math.random() * canvas.width, canvas.height);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.fillStyle = 'red';
    let baseAngle;
    switch (pacman.direction) {
        case 'up':
            baseAngle = -Math.PI / 2;
            break;
        case 'down':
            baseAngle = Math.PI / 2;
            break;
        case 'left':
            baseAngle = Math.PI;
            break;
        case 'right':
        default:
            baseAngle = 0;
            break;
    }
    const startAngle = baseAngle + pacman.mouthAngle * Math.PI;
    const endAngle = baseAngle + (2 - pacman.mouthAngle) * Math.PI;
    ctx.arc(pacman.x, pacman.y, pacman.radius, startAngle, endAngle);
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = 'black';
    obstacles.forEach(obj => {
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            ctx.beginPath();
            ctx.moveTo(obj.x + Math.cos(angle) * obj.radius, obj.y + Math.sin(angle) * obj.radius);
            ctx.lineTo(obj.x + Math.cos(angle) * obj.radius * 1.3, obj.y + Math.sin(angle) * obj.radius * 1.3);
            ctx.stroke();
        }
    });

    ghosts.forEach(obj => {
        ctx.beginPath();
        ctx.fillStyle = 'blue';
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(obj.x - 5, obj.y - 5, 3, 0, Math.PI * 2);
        ctx.arc(obj.x + 5, obj.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    if (ghostsEaten >= WIN_SCORE) {
        ctx.fillStyle = 'red';
        ctx.font = '40px "Creepster"';
        ctx.textAlign = 'center';
        ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
        backgroundMusic.pause();
        chompSound.pause();
    }
}

function flashScreen() {
    let flashCount = 0;
    const flashInterval = setInterval(() => {
        ctx.fillStyle = flashCount % 2 === 0 ? 'black' : 'red';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flashCount++;
    }, 200);

    introSound.onended = () => {
        clearInterval(flashInterval);
        backgroundMusic.play();
        chompSound.play();
        gameLoop();
    };
}

function gameLoop() {
    movePacman();
    moveGhosts();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game on button click
startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    canvas.style.display = 'block';
    scoreContainer.style.display = 'block';
    introSound.play();
    flashScreen();
});