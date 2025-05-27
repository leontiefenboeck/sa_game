class Ball {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 0.15 * canvas.height;
        this.radius = 0.012 * canvas.width; 
        this.vx = 0;
        this.vy = 0;
        this.isActive = false;
        this.particle = null;
    }

    update(splines, canvas) {

        this.x += this.vx;
        this.y += this.vy;
    
        const friction = 0.99;
        this.vx *= friction;
        this.vy *= friction;

        if (this.particle == null) {
            if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.vx *= -1;
            }
            if (this.x + this.radius > canvas.width) {
                this.x = canvas.width - this.radius;
                this.vx *= -1;
            }
            if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.vy *= -1;
            }
            if (this.y + this.radius > canvas.height) {
                this.y = canvas.height - this.radius;
                this.vy *= -1;
            }
        }
        else {
            if (this.particle.location.x - this.particle.radius < 0) {
                this.particle.location.x = this.particle.radius;
                this.particle.speed.x *= -1;
            }
            if (this.particle.location.x + this.particle.radius > canvas.width) {
                this.particle.location.x = canvas.width - this.particle.radius;
                this.particle.speed.x *= -1;
            }
            if (this.particle.location.y - this.particle.radius < 0) {
                this.particle.location.y = this.particle.radius;
                this.particle.speed.y *= -1;
            }
            if (this.particle.location.y + this.particle.radius > canvas.height) {
                this.particle.location.y = canvas.height - this.particle.radius;
                this.particle.speed.y *= -1;
            }
            this.particle.update(this.particles, delta);
        }

        this.checkStopped();
        this.testCollisions(splines);
    }

    testCollisions(splines) {
        if (splines) { 
            for (const spline of splines) {
                if (spline.object.testCollision(this)) {
                    this.bounce(spline.object);
                }
            }
        }
    }

    bounce(obstacle) {
        if (obstacle.constructor.name === "Rectangle") {
            // Find the overlap on each side
            const dx = this.x - obstacle.position.x;
            const dy = this.y - obstacle.position.y;
            const halfW = obstacle.width / 2;
            const halfH = obstacle.height / 2;
            const overlapX = halfW - Math.abs(dx);
            const overlapY = halfH - Math.abs(dy);

            // Bounce on the axis with the least overlap
            if (overlapX < overlapY) {
                // Bounce horizontally
                this.vx *= -1;
                // Nudge ball out of rectangle to prevent sticking
                this.x = dx > 0
                    ? obstacle.position.x + halfW + this.radius
                    : obstacle.position.x - halfW - this.radius;
            } else {
                // Bounce vertically
                this.vy *= -1;
                this.y = dy > 0
                    ? obstacle.position.y + halfH + this.radius
                    : obstacle.position.y - halfH - this.radius;
            }
        } else if (obstacle.constructor.name === "Circle") {
            // Vector from circle center to ball center
            const dx = this.x - obstacle.position.x;
            const dy = this.y - obstacle.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) return; // Avoid division by zero

            // Normal vector
            const nx = dx / dist;
            const ny = dy / dist;

            // Dot product of velocity and normal
            const dot = this.vx * nx + this.vy * ny;

            // Reflect velocity over normal
            this.vx = this.vx - 2 * dot * nx;
            this.vy = this.vy - 2 * dot * ny;

            // Nudge ball out of circle to prevent sticking
            const minDist = obstacle.radius + this.radius;
            this.x = obstacle.position.x + nx * minDist;
            this.y = obstacle.position.y + ny * minDist;
        }
    }

    checkStopped() {
        if (
            this.isActive &&
            Math.abs(this.vx) < 0.1 &&
            Math.abs(this.vy) < 0.1
        ) {
            this.isActive = false; 
            setTimeout(() => {
                window.location.reload();
            }, 1000); 
        }
    }

    render(ctx) {
        // shadow
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(
            this.x, 
            this.y + this.radius * 0.55, 
            this.radius * 0.95, 
            this.radius * 0.35, 
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = '#222';
        ctx.filter = 'blur(2px)';
        ctx.fill();
        ctx.filter = 'none';
        ctx.restore();

        // Create radial gradient for 3D effect
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.4, this.y - this.radius * 0.4, this.radius * 0.2, // inner light
            this.x, this.y, this.radius // outer edge
        );
        gradient.addColorStop(0, '#fff');         // highlight
        gradient.addColorStop(0.3, '#ff6666');    // lighter red
        gradient.addColorStop(1, '#b20000');      // dark red

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
    }
}