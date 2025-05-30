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
        this.dragCurrent = null;
        this.dragStart = { x: 0, y: 0 };

        this.particles = [];
        this.fracture = null;

        this.updateInterval = null;
        this.renderInterval = null;

        this.initEventListeners();
        this.isGameRunning = true;
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

    stop() {
        this.isGameRunning = false;
        clearInterval(this.updateInterval);
        clearInterval(this.renderInterval);
    }

    update() {
        if (this.fracture != null) {

            this.fracture.update();
        }
        this.updateBall();
    }

    render() {  
        const { ctx, canvas } = this;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (this.fracture != null) {

            this.fracture.visualize(this.ctx);
        }
        this.drawGoalCircles();
        this.drawBall();
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
            this.dragCurrent = { x: e.offsetX, y: e.offsetY }; // <-- Add this line
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.dragCurrent = { x: e.offsetX, y: e.offsetY }; // <-- Add this block
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const dragEnd = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };

                this.ball.vx = (this.dragStart.x - dragEnd.x) * 10;
                this.ball.vy = (this.dragStart.y - dragEnd.y) * 10;

                this.isDragging = false;
                this.ball.isActive = true;
                this.dragCurrent = null; // <-- Optionally clear dragCurrent
                if (this.ball.particle != null) {
                    this.ball.particle.speed = new Vector2(this.ball.vx, this.ball.vy);

                }

            }

        });
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                window.location.reload();
            }
            if (e.code === 'Escape' || e.key === 'Escape') {
                if (this.isGameRunning) this.stop();
                else this.start();
            }
        });
    }

    updateBall() {
        const { ball, canvas } = this;

        if (ball.particle == null) {

            const friction = 0.99;
            ball.vx *= friction;
            ball.vy *= friction;

            ball.x += ball.vx / this.animationRate;
            ball.y += ball.vy / this.animationRate;

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
                if (this.fracture) {
                    this.fracture.checkForHit(ball.x,ball.y);
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
            ball.particle.update(this.particles, 1/this.animationRate);
        }

        this.checkBallInHole();
        this.checkBallStopped();
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
        const { ctx } = this;

        if (this.isDragging && this.dragStart && this.dragCurrent) {
            this.drawDragArrow(ctx, this.ball, this.dragStart, this.dragCurrent);
        }

        const gradient = ctx.createRadialGradient(
            this.ball.x - this.ball.radius * 0.4, this.ball.y - this.ball.radius * 0.4, this.ball.radius * 0.2,
            this.ball.x, this.ball.y, this.ball.radius
        );
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, '#ff6666');
        gradient.addColorStop(1, '#b20000');

        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#123';
        ctx.stroke();
    }

    drawDragArrow(ctx, ball, dragStart, dragCurrent) {
        const cx = ball.x;
        const cy = ball.y;
        const dx = dragCurrent.x - cx;
        const dy = dragCurrent.y - cy;
        const dragLen = Math.sqrt(dx * dx + dy * dy);

        const maxDragLen = 120; // pixels
        const cappedDragLen = Math.min(dragLen, maxDragLen);

        if (cappedDragLen > 10) {
            const dirX = dx / (dragLen || 1);
            const dirY = dy / (dragLen || 1);

            const tipX = cx + dirX * ball.radius;
            const tipY = cy + dirY * ball.radius;

            const baseX = cx + dirX * (ball.radius + cappedDragLen);
            const baseY = cy + dirY * (ball.radius + cappedDragLen);

            const minWidth = 10;
            const maxWidth = 28;
            const width = minWidth + (maxWidth - minWidth) * (cappedDragLen / maxDragLen);

            const perpX = -dirY;
            const perpY = dirX;

            const leftBaseX = baseX + perpX * (width * 0.5);
            const leftBaseY = baseY + perpY * (width * 0.5);
            const rightBaseX = baseX - perpX * (width * 0.5);
            const rightBaseY = baseY - perpY * (width * 0.5);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(leftBaseX, leftBaseY);
            ctx.lineTo(tipX, tipY);
            ctx.lineTo(rightBaseX, rightBaseY);
            ctx.closePath();

            const grad = ctx.createLinearGradient(baseX, baseY, tipX, tipY);
            grad.addColorStop(0, "#1976d2");
            grad.addColorStop(1, "#00e676");
            ctx.fillStyle = grad;
            ctx.shadowColor = "#1976d2";
            ctx.shadowBlur = 12;
            ctx.globalAlpha = 0.85;
            ctx.fill();

            // white outline
            ctx.globalAlpha = 1;
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#fff";
            ctx.stroke();
            ctx.restore();
        }
    }

    drawGoalCircles() {
        if(!this.holes)
        {
            return;
        }
        const { ctx, hole } = this;
        ctx.save();
        ctx.beginPath();
        ctx.arc(holes[0].x, holes[0].y, holes[0].radius, 0, Math.PI * 2);
        ctx.fillStyle = '#93cefa'; 
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        ctx.restore();

        // Draw the inner shadow for depth
        const gradient = ctx.createRadialGradient(
            holes[0].x, holes[0].y, holes[0].radius * 0.2,
            holes[0].x, holes[0].y, holes[0].radius
        );
        gradient.addColorStop(0, 'rgb(223, 246, 248)');
        gradient.addColorStop(1, 'rgba(187, 244, 244, 0.39)');
        ctx.save();
        ctx.beginPath();
        ctx.arc(holes[0].x, holes[0].y, holes[0].radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    }

    renderLevelComplete() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw rounded rectangle background
        const boxWidth = 0.4 * canvas.width;
        const boxHeight = 0.2 * canvas.height;
        const boxX = (canvas.width - boxWidth) / 2;
        const boxY = (canvas.height - boxHeight) / 2;
        const radius = 30;

        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 4;

        // Rounded rectangle path
        ctx.beginPath();
        ctx.moveTo(boxX + radius, boxY);
        ctx.lineTo(boxX + boxWidth - radius, boxY);
        ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius);
        ctx.lineTo(boxX + boxWidth, boxY + boxHeight - radius);
        ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight);
        ctx.lineTo(boxX + radius, boxY + boxHeight);
        ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius);
        ctx.lineTo(boxX, boxY + radius);
        ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Draw shadowed text
        ctx.save();
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#888';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#222';
        ctx.fillText('Level Complete!', canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
}