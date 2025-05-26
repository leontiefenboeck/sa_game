class Ball {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 100;
        this.radius = 15;
        this.vx = 0;
        this.vy = 0;
        this.isActive = false;
        this.particle = null;
    }

    update(splines, canvas) {

        this.x += this.vx;
        this.y += this.vy;
    
        const friction = 0.98;
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
        this.testCollisions(splines, canvas);
    }

    testCollisions(splines, canvas) {
        if (splines) { 
            for (const spline of splines) {
                const obj = spline.object;
                const pos = spline.position;
                const obstacle = {
                    x: pos.x,
                    y: pos.y,
                    radius: obj.size * canvas.width 
                };
                if (this.checkCircleCollision(obstacle)) {
                    this.bounce(obstacle);
                    // Optional: move this out of collision
                    const overlap = (this.radius + obstacle.radius) - Math.sqrt((this.x - obstacle.x) ** 2 + (this.y - obstacle.y) ** 2);
                    this.x += (this.x - obstacle.x) / Math.sqrt((this.x - obstacle.x) ** 2 + (this.y - obstacle.y) ** 2) * overlap;
                    this.y += (this.y - obstacle.y) / Math.sqrt((this.x - obstacle.x) ** 2 + (this.y - obstacle.y) ** 2) * overlap;
                }
            }
        }
    }

    checkCircleCollision(obstacle) {
        const dx = this.x - obstacle.x;
        const dy = this.y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + obstacle.radius);
    }

    bounce(obstacle) {
        const dx = this.x - obstacle.x;
        const dy = this.y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / distance;
        const ny = dy / distance;

        const dot = this.vx * nx + this.vy * ny;

        this.vx = this.vx - 2 * dot * nx;
        this.vy = this.vy - 2 * dot * ny;
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
        // Create radial gradient for 3D effect
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.4, this.y - this.radius * 0.4, this.radius * 0.2, // inner light
            this.x, this.y, this.radius // outer edge
        );
        gradient.addColorStop(0, '#fff');         // highlight
        gradient.addColorStop(0.3, '#ff6666');    // lighter red
        gradient.addColorStop(1, '#b20000');      // dark red

        // Draw shadow
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.radius * 0.5, this.radius * 0.9, 0, Math.PI * 2);
        ctx.closePath();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.restore();

        // Draw this with gradient
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();

        // Optional: Draw a small white highlight
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.4, this.y - this.radius * 0.4, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fill();
        ctx.closePath();
    }
}