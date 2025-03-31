document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const audio = document.getElementById('backgroundMusic');
    const startButton = document.getElementById('startButton');

    const playerImage = new Image();
    const autoImage = new Image();
    playerImage.src = 'assets/fuzzy bear.png';
    autoImage.src = 'assets/Bee-Cartoon-PNG-File.png';

    let player, autoObject;
    let bgColor = '#f0f0f0';
    let gameStarted = false;

    let imagesLoaded = 0;
    const onImageLoad = () => {
        imagesLoaded++;
        if (imagesLoaded === 2) {
            player = new GameObject(400, 300, 'assets/fuzzy bear.png', 0, 0, 0.05);     // Bear: ~60x79
            autoObject = new GameObject(200, 200, 'assets/Bee-Cartoon-PNG-File.png', 2, 3, 0.05); // Bee: ~63x63
        }
    };
    playerImage.onload = onImageLoad;
    autoImage.onload = onImageLoad;

    document.addEventListener('keydown', (e) => {
        if (!gameStarted || !player) return;
        switch(e.key) {
            case 'ArrowUp': player.speedY = -5; break;
            case 'ArrowDown': player.speedY = 5; break;
            case 'ArrowLeft': player.speedX = -5; break;
            case 'ArrowRight': player.speedX = 5; break;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (!gameStarted || !player) return;
        if (['ArrowUp', 'ArrowDown'].includes(e.key)) player.speedY = 0;
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) player.speedX = 0;
    });

    function checkCollision(obj1, obj2) {
        if (!obj1.width || !obj2.width) return false;
        return (
            obj1.x - obj1.width / 2 < obj2.x + obj2.width / 2 &&
            obj1.x + obj1.width / 2 > obj2.x - obj2.width / 2 &&
            obj1.y - obj1.height / 2 < obj2.y + obj2.height / 2 &&
            obj1.y + obj1.height / 2 > obj2.y - obj2.height / 2
        );
    }

    function animate() {
        if (!gameStarted || !player || !autoObject) return;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        player.move(canvas);
        autoObject.move(canvas);
        player.draw(ctx);
        autoObject.draw(ctx);

        if (checkCollision(player, autoObject)) {
            bgColor = '#ffcccc';
            player.resize(1.5);
        } else {
            bgColor = '#f0f0f0';
        }

        requestAnimationFrame(animate);
    }

    startButton.addEventListener('click', () => {
        if (!gameStarted && player && autoObject) {
            gameStarted = true;
            audio.muted = false;
            audio.play().catch(e => console.log("Audio play failed:", e));
            animate();
            startButton.textContent = "Dancing";
            startButton.disabled = true;
        }
    });
});