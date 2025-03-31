class GameObject {
    constructor(x, y, imageSrc, speedX = 0, speedY = 0, scale = 1) {
        this.x = x;
        this.y = y;
        this.image = new Image();
        this.image.src = imageSrc;
        this.speedX = speedX;
        this.speedY = speedY;
        this.scale = scale;
        this.width = 10;
        this.height = 10;
        this.flipAngle = 0;
        this.scaleX = 1;
        
        this.image.onload = () => {
            this.width = Math.min(this.image.width * this.scale, 100);
            this.height = Math.min(this.image.height * this.scale, 100);
            console.log(`Loaded ${imageSrc}: ${this.width}x${this.height}`);
        };
        this.image.onerror = () => {
            console.error(`Failed to load ${imageSrc}`);
        };
    }

    draw(ctx) {
        if (this.width && this.height) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(this.scaleX, 1);
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }

    move(canvas) {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.speedX !== 0 || this.speedY !== 0) {
            this.flipAngle += 0.05; // twril
            this.scaleX = Math.sin(this.flipAngle) > 0 ? 1 : -1;
        } else {
            this.scaleX = 1;
        }

        if (this.x - this.width / 2 < 0) {
            this.x = this.width / 2;
            this.speedX = -this.speedX;
        }
        if (this.x + this.width / 2 > canvas.width) {
            this.x = canvas.width - this.width / 2;
            this.speedX = -this.speedX;
        }
        if (this.y - this.height / 2 < 0) {
            this.y = this.height / 2;
            this.speedY = -this.speedY;
        }
        if (this.y + this.height / 2 > canvas.height) {
            this.y = canvas.height - this.height / 2;
            this.speedY = -this.speedY;
        }
    }

    resize(factor) {
        const oldWidth = this.width;
        const oldHeight = this.height;
        this.width = Math.min(this.width * factor, 200);
        this.height = Math.min(this.height * factor, 200);
        if (this.width !== oldWidth || this.height !== oldHeight) {
            console.log(`Resized ${this.image.src}: ${oldWidth}x${oldHeight} -> ${this.width}x${this.height}`);
        }
    }
}