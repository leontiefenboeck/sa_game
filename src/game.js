class Game {
    constructor(animationRate, fps, canvas) {
        this.animationRate = animationRate;
        this.fps = fps;

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

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

        this.addedUpdates = [];
        this.addedRenders = [];
        this.particles = [];

        this.updateInterval = null;
        this.renderInterval = null;

        this.initEventListeners();
    }

    addUpdate(update) { this.addedUpdates.push(update); }
    addRender(render) { this.addedRenders.push(render); }
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

    stop() {
        clearInterval(this.updateInterval);
        clearInterval(this.renderInterval);
    }

    update() {
        this.updateBall();
        this.addedUpdates.forEach(update => update());
    }

    render() {  
        const { ctx, canvas } = this;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.drawGoalCircles();
        this.drawBall();
        this.addedRenders.forEach(render => render(ctx));
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
            }
        });
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
            ball.particle.update(this.particles, delta);
        }
        this.checkBallInHole();
    }

    drawBall() {
        const { ctx, ball } = this;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
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