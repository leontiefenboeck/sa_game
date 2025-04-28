class Game {
    constructor(animationRate, canvas) {
        this.animationRate = animationRate;

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.goalCircles = [];

        this.ball = {
            x: canvas.width / 2,
            y: canvas.height - 20,
            radius: 15,
            vx: 0,
            vy: 0
        };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };

        this.addedUpdates = [];
        this.addedRenders = [];

        this.initEventListeners();

        this.lastFrameTime = 0; 
        this.fps = 0; 

        console.log('Game initialized');
    }

    loop(timestamp) 
    {
        let delta = 0;

        if (this.lastFrameTime) {
            delta = timestamp - this.lastFrameTime;
            if (!this.fpsUpdateTime || timestamp - this.fpsUpdateTime >= 500) {
                this.fps = Math.round(1000 / delta);
                this.fpsUpdateTime = timestamp;
            }
        }
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

        this.displayFPS();
    }

    addUpdate(update) { this.addedUpdates.push(update); }
    addRender(render) { this.addedRenders.push(render); }

    // TODO: cant drag out of canvas
    initEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragStart = { x: e.offsetX, y: e.offsetY };
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                const dragEnd = { x: e.offsetX, y: e.offsetY };

                this.ball.vx = (this.dragStart.x - dragEnd.x) * 5;
                this.ball.vy = (this.dragStart.y - dragEnd.y )* 5;

                this.isDragging = false;
            }
        });
    }

    setHoles(goals) { this.goalCircles = goals; }

    checkGoalCollision() {
        for (const goal of this.goalCircles) {
            const dx = this.ball.x - goal.x;
            const dy = this.ball.y - goal.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.ball.radius + goal.radius) {
                this.displayLevelCompleteMessage();
            }
        }
        return false;
    }

    updateBall(delta) {
        const { ball, canvas } = this;
    
        const deltaSeconds = delta / 1000;
        ball.x += ball.vx * deltaSeconds;
        ball.y += ball.vy * deltaSeconds;
    
        const friction = 0.98;
        ball.vx *= friction;
        ball.vy *= friction;
    
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
    
        this.checkGoalCollision();
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
        const { ctx, goalCircles } = this;
        ctx.fillStyle = 'green';
        goalCircles.forEach(goal => {
            ctx.beginPath();
            ctx.arc(goal.x, goal.y, goal.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        });
    }

    displayLevelCompleteMessage() {
        const { ctx, canvas } = this;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);

        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Level Completed!`, canvas.width / 2, canvas.height / 2);
    }

    displayFPS() {
        const { ctx } = this;
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText(`FPS: ${this.fps}`, 10, 20);
    }
}