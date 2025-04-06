//ghosts

export class GameObject {
    constructor(id, x, y, radius, value = 0) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.value = value;
        this.speed = 2; // Speed for ghost
    }

    //  random ghost movement
    moveRandomly(canvasWidth, canvasHeight, obstacles) {
        // Randomly decide direction
        const direction = Math.random() * 2 * Math.PI;
        const dx = Math.cos(direction) * this.speed;
        const dy = Math.sin(direction) * this.speed;

        //  new position
        let newX = this.x + dx;
        let newY = this.y + dy;

        // Keep within canvas boundaries
        newX = Math.max(this.radius, Math.min(newX, canvasWidth - this.radius));
        newY = Math.max(this.radius, Math.min(newY, canvasHeight - this.radius));

        // Check collision with obstacles
        const tempGhost = { ...this, x: newX, y: newY };
        let canMove = true;
        for (let obstacle of obstacles) {
            if (this.checkCollision(tempGhost, obstacle)) {
                canMove = false;
                break;
            }
        }

        // Update position if movement is allowed
        if (canMove) {
            this.x = newX;
            this.y = newY;
        }
    }

    
    checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.radius + obj2.radius);
    }
}