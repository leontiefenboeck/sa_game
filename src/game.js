class Game {
    constructor(animationRate, canvas) {
        this.animationRate = animationRate;

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

        this.initEventListeners();
    }

    addUpdate(update) { this.addedUpdates.push(update); }
    addRender(render) { this.addedRenders.push(render); }
    setHoles(holes) { this.holes = holes; }

    loop(timestamp) {
        if (!this.isGameRunning) {
            this.renderLevelComplete();
            return; 
        }

        let delta = 0;
        if (this.lastFrameTime) { delta = timestamp - this.lastFrameTime; }
        this.lastFrameTime = timestamp;

        this.update(delta);
        this.render();

        setTimeout(() => {
            requestAnimationFrame((timestamp) => this.loop(timestamp));
        }, 1000 / this.animationRate);
    }

    update(delta) {
        this.updateBall(delta);
        this.addedUpdates.forEach(update => update(delta));
    }

    render() {  
        const { ctx, canvas } = this;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.drawGoalCircles();
        this.drawBall();
        this.addedRenders.forEach(render => render(ctx));
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
    
                this.ball.vx = (this.dragStart.x - dragEnd.x) * 5;
                this.ball.vy = (this.dragStart.y - dragEnd.y) * 5;
    
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

    updateBall(delta) {
        const { ball, canvas } = this;

        const friction = 0.9;
        ball.vx *= friction;
        ball.vy *= friction;

        if (ball.particle == null) {
            const deltaSeconds = delta / 1000;
            ball.x += ball.vx * deltaSeconds;
            ball.y += ball.vy * deltaSeconds;
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