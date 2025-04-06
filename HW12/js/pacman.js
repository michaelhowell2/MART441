export class PacMan {
    constructor(x, y, radius, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.mouthAngle = 0;
        this.mouthSpeed = 0.02; 
        this.direction = 'right'; // Default direction
    }

    // Update mouth animation
    updateMouth() {
        this.mouthAngle += this.mouthSpeed;
        if (this.mouthAngle > 0.5 || this.mouthAngle < 0) {
            this.mouthSpeed = -this.mouthSpeed;
        }
    }

    // Update direction based on movement
    setDirection(key) {
        switch (key) {
            case 'ArrowUp':
                this.direction = 'up';
                break;
            case 'ArrowDown':
                this.direction = 'down';
                break;
            case 'ArrowLeft':
                this.direction = 'left';
                break;
            case 'ArrowRight':
                this.direction = 'right';
                break;
        }
    }
}