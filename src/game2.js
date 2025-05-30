class Game2 {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.animationRate = 60;
        this.fps = 60;

        this.isGameRunning = true;

        this.holes = [];

        this.ball = {
            x: canvas.width / 2,
            y: canvas.height - 100,
            radius: 15,
            vx: 0,
            vy: 0,
            isActive: false,
            particle: null
        };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };

        this.particles = [];
        this.splines = [];
        this.fracture = null;

        this.updateInterval = null;
        this.renderInterval = null;

        this.initEventListeners();
    }

    setHoles(holes) { this.holes = holes; }

    start() {
        this.isGameRunning = true;

        this.updateInterval = setInterval(() => {
            if (this.isGameRunning) {
                this.update();
            }
        }, 1000 / this.animationRate);

        this.renderInterval = setInterval(() => {
            if (this.isGameRunning) {
                this.render();
            } else {
                this.renderLevelComplete();
            }
        }, 1000 / this.fps);
    }

    update() {
        this.updateBall();
        this.splines.forEach(spline => spline.update());
    }

    render() {  
        const { ctx, canvas } = this;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (this.fracture != null) {

            this.fracture.visualize(this.ctx);
        }
        this.drawGoalCircles();
        this.drawBall();
        this.splines.forEach(spline => spline.render(ctx));
        this.particles.forEach(particle => particle.render(this.particles, ctx));

    }

    setAnimationRate(newRate) {
        this.animationRate = newRate;
        clearInterval(this.updateInterval);
        this.updateInterval = setInterval(() => {
            if (this.isGameRunning) {
                this.update();
            }
        }, 1000 / this.animationRate);
    }

    setFps(newFps) {
        this.fps = newFps;
        clearInterval(this.renderInterval);
        this.renderInterval = setInterval(() => {
            if (this.isGameRunning) {
                this.render();
            } else {
                this.renderLevelComplete();
            }
        }, 1000 / this.fps);
    }

    initEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.ball.isActive == true) {
                return;
            }
            this.isDragging = true;
            this.dragStart = { x: e.offsetX, y: e.offsetY };
        });
    
        window.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const dragEnd = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
    
                this.ball.vx = (this.dragStart.x - dragEnd.x) * 0.1;
                this.ball.vy = (this.dragStart.y - dragEnd.y) * 0.1;
    
                this.isDragging = false;
                this.ball.isActive = true;
                if (this.ball.particle != null) {
                    this.ball.particle.speed = new Vector2(this.ball.vx, this.ball.vy);

                }
                if (this.fracture) {
                    this.fracture.hit();
                }
            }

        });
    }

    updateBall() {
        const { ball, canvas } = this;

        ball.x += ball.vx;
        ball.y += ball.vy;
    
        const friction = 0.99;
        ball.vx *= friction;
        ball.vy *= friction;

        if (ball.particle == null) {
            if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.vx *= -1;
            }
            if (ball.x + ball.radius > canvas.width) {
                ball.x = canvas.width - ball.radius;
                ball.vx *= -1;
            }
            if (ball.y - ball.radius < 0) {
                ball.y = ball.radius;
                ball.vy *= -1;
            }
            if (ball.y + ball.radius > canvas.height) {
                ball.y = canvas.height - ball.radius;
                ball.vy *= -1;
            }
        }
        else {
            if (ball.particle.location.x - ball.particle.radius < 0) {
                ball.particle.location.x = ball.particle.radius;
                ball.particle.speed.x *= -1;
            }
            if (ball.particle.location.x + ball.particle.radius > canvas.width) {
                ball.particle.location.x = canvas.width - ball.particle.radius;
                ball.particle.speed.x *= -1;
            }
            if (ball.particle.location.y - ball.particle.radius < 0) {
                ball.particle.location.y = ball.particle.radius;
                ball.particle.speed.y *= -1;
            }
            if (ball.particle.location.y + ball.particle.radius > canvas.height) {
                ball.particle.location.y = canvas.height - ball.particle.radius;
                ball.particle.speed.y *= -1;
            }
            ball.particle.update(this.particles, this.animationRate);
        }

        if (this.splines) { 
            for (const spline of this.splines) {
                const obj = spline.object;
                const pos = spline.position;
                const obstacle = {
                    x: pos.x,
                    y: pos.y,
                    radius: obj.size * canvas.width 
                };
                if (checkCircleCollision(ball, obstacle)) {
                    this.bounceBall(ball, obstacle);
                    // Optional: move ball out of collision
                    const overlap = (ball.radius + obstacle.radius) - Math.sqrt((ball.x - obstacle.x) ** 2 + (ball.y - obstacle.y) ** 2);
                    ball.x += (ball.x - obstacle.x) / Math.sqrt((ball.x - obstacle.x) ** 2 + (ball.y - obstacle.y) ** 2) * overlap;
                    ball.y += (ball.y - obstacle.y) / Math.sqrt((ball.x - obstacle.x) ** 2 + (ball.y - obstacle.y) ** 2) * overlap;
                }
            }
        }

        this.checkBallInHole();
        this.checkBallStopped();
    }

    bounceBall(ball, obstacle) {
        // Calculate normal
        const dx = ball.x - obstacle.x;
        const dy = ball.y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / distance;
        const ny = dy / distance;

        // Dot product of velocity and normal
        const dot = ball.vx * nx + ball.vy * ny;

        // Reflect velocity
        ball.vx = ball.vx - 2 * dot * nx;
        ball.vy = ball.vy - 2 * dot * ny;
    }

    checkBallInHole() {
        for (const goal of this.holes) {
            const dx = this.ball.x - goal.x;
            const dy = this.ball.y - goal.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.ball.radius + goal.radius) {
                this.isGameRunning = false;
                setTimeout(() => {
                    window.history.back();
                }, 3000); 
                return true;
            }
        }
        return false;
    }

    checkBallStopped() {
        if (
            this.ball.isActive &&
            Math.abs(this.ball.vx) < 0.1 &&
            Math.abs(this.ball.vy) < 0.1
        ) {
            this.ball.isActive = false; 
            setTimeout(() => {
                window.location.reload();
            }, 1000); 
        }
    }

    drawBall() {
        const { ctx, ball } = this;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }

    drawGoalCircles() {
        const { ctx, holes: goalCircles } = this;
        ctx.fillStyle = 'green';
        goalCircles.forEach(goal => {
            ctx.beginPath();
            ctx.arc(goal.x, goal.y, goal.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        });
    }

    drawAttractionCircles() {
        const { ctx, holes: goalCircles } = this;
        ctx.fillStyle = 'green';
        goalCircles.forEach(goal => {
            ctx.beginPath();
            ctx.arc(goal.x, goal.y, goal.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        });
    }

    drawRepellingCircles() {
        const { ctx, holes: goalCircles } = this;
        ctx.fillStyle = 'green';
        goalCircles.forEach(goal => {
            ctx.beginPath();
            ctx.arc(goal.x, goal.y, goal.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        });
    }

    renderLevelComplete() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        ctx.fillStyle = 'black';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Level Complete!', canvas.width / 2, canvas.height / 2);
    }
}