class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isGameRunning = true;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.goalCircles = [];
        this.ball = {
            x: canvas.width / 2,
            y: canvas.height - 20,
            radius: 15,
            vx: 0,
            vy: 0
        };

        this.addedAnimations = [];
        this.initEventListeners();
        console.log('Game initialized');
    }

    gameLoop() {
        if (!this.isGameRunning) return;

        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.drawGoalCircles();
        this.animateBall();
        this.addedAnimations.forEach(animation => animation(ctx));

        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.isGameRunning = true;
        this.gameLoop();
    }

    stop() {
        this.isGameRunning = false;
    }

    addAnimation(func) {
        this.addedAnimations.push(func);
    }

    initEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragStart = { x: e.offsetX, y: e.offsetY };
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                const dragEnd = { x: e.offsetX, y: e.offsetY };
                this.ball.vx = (this.dragStart.x - dragEnd.x) * 0.1;
                this.ball.vy = (this.dragStart.y - dragEnd.y) * 0.1;
                this.isDragging = false;
            }
        });
    }

    setHoles(goals) {
        this.goalCircles = goals;
    }

    checkGoalCollision() {
        for (const goal of this.goalCircles) {
            const dx = this.ball.x - goal.x;
            const dy = this.ball.y - goal.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.ball.radius + goal.radius) {
                this.isGameRunning = false;
                this.displayLevelCompleteMessage();
                return true;
            }
        }
        return false;
    }

    animateBall() { 
        this.updateBall();
        this.drawBall();
    }

    updateBall() {
        const { ball, canvas } = this;

        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.98; 
        ball.vy *= 0.98;

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
}