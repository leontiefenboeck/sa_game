class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.animationRate = 60;
        this.fps = 60;

        this.isGameRunning = true;

        this.ball = null;
        this.hole = null;
        this.playableArea = null;

        this.particles = [];
        this.splines = [];
        this.rigidBodies = [];

        this.updateInterval = null;
        this.renderInterval = null;

        this.initEventListeners();
    }

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
        this.checkBallOutOfBounds();
        this.checkBallInHole();
        
        for (let i = 0; i < this.rigidBodies.length; i++) {
            for (let j = i + 1; j < this.rigidBodies.length; j++) {
                const bodyA = this.rigidBodies[i];
                const bodyB = this.rigidBodies[j];
                bodyA.handleCollision(bodyB);
            }
        }

        this.splines.forEach(spline => spline.update(1 / this.animationRate));
        this.rigidBodies.forEach(body => body.update(1 / this.animationRate));
    }

    render() {  
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.drawPlayArea();
        this.drawHoles();
        this.splines.forEach(spline => spline.render(ctx));
        this.rigidBodies.forEach(body => body.render(ctx));
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
            this.ball.onMouseDown(e, this.canvas);
        });

        window.addEventListener('mousemove', (e) => {
            this.ball.onMouseMove(e, this.canvas);
        });

        window.addEventListener('mouseup', (e) => {
            this.ball.onMouseUp(e, this.canvas);
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                window.location.reload();
            }
        });
    }

    checkBallInHole() {
        hole = this.hole;
        const dx = this.ball.position.x - hole.x;
        const dy = this.ball.position.y - hole.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance + this.ball.radius <= hole.radius) {
            this.isGameRunning = false;
            setTimeout(() => {
                window.history.back();
            }, 3000); 
            return true;
        }
        
        return false;
    }

    checkBallOutOfBounds() {
        if (!this.playableArea) return;
        if (!this.ctx.isPointInPath(this.playableArea, this.ball.position.x, this.ball.position.y)) {
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
        ctx.fillStyle = 'rgb(14, 66, 74)';
        ctx.fill(area);
        ctx.restore();
    }

    drawHoles() {
        const { ctx, hole } = this;
        ctx.save();
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#93cefa'; 
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#fff';
        ctx.stroke();

        ctx.restore();

        // Draw the inner shadow for depth
        const gradient = ctx.createRadialGradient(
            hole.x, hole.y, hole.radius * 0.2,
            hole.x, hole.y, hole.radius
        );
        gradient.addColorStop(0, 'rgb(223, 246, 248)');
        gradient.addColorStop(1, 'rgba(187, 244, 244, 0.39)');
        ctx.save();
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
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