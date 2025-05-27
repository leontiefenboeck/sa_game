class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.animationRate = 60;
        this.fps = 60;

        this.isGameRunning = true;

        this.holes = [];
        this.playableArea = null;

        this.ball = new Ball();
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };

        this.particles = [];
        this.splines = [];

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
        this.splines.forEach(spline => spline.update());
        this.ball.update(this.splines, this.canvas);
        this.checkBallOutOfBounds();
        this.checkBallInHole();
    }

    render() {  
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.drawPlayArea();
        this.drawHoles();
        this.ball.render(ctx);
        this.splines.forEach(spline => spline.render(ctx));
        this.particles.forEach(particle => particle.render(ctx));
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
        for (const hole of this.holes) {
            const dx = this.ball.x - hole.x;
            const dy = this.ball.y - hole.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance + this.ball.radius <= hole.radius) {
                this.isGameRunning = false;
                setTimeout(() => {
                    window.history.back();
                }, 3000); 
                return true;
            }
        }
        return false;
    }

    checkBallOutOfBounds() {
        if (!this.playableArea) return;
        if (!this.ctx.isPointInPath(this.playableArea, this.ball.x, this.ball.y)) {
            setTimeout(() => {
                window.location.reload();
            }, 50); 
        }
    }

    drawPlayArea() {
        const { ctx } = this;
        const area = this.playableArea;

        ctx.save();
        ctx.shadowColor = '#58b1e8';
        ctx.shadowBlur = 25;
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#2c4352';
        ctx.fill(area);
        ctx.restore();
    }

    drawHoles() {
        const { ctx, holes } = this;
        holes.forEach(hole => {
            // Draw the cup (deep teal, fits play area)
            ctx.save();
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#93cefa'; 
            ctx.shadowColor = '#93cefa';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();

            // Draw the inner shadow for depth
            const gradient = ctx.createRadialGradient(
                hole.x, hole.y, hole.radius * 0.2,
                hole.x, hole.y, hole.radius
            );
            gradient.addColorStop(0, 'rgb(223, 246, 248)');
            gradient.addColorStop(1, 'rgba(187, 244, 244, 0)');
            ctx.save();
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.restore();
        });
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