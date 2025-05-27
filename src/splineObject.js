const OBSTACLE_COLOR = '#ffb347';
const OBSTACLE_HIGHLIGHT = '#ffe5b0'; 
const OBSTACLE_SHADOW = '#b97a1a';    

class Rectangle {
    constructor(width, height, canvas) {
        this.width = width * canvas.width;
        this.height = height * canvas.height;

        this.color = OBSTACLE_COLOR;
        this.position = { x: 0, y: 0 };

        // round corners
        let radius = 5;
        let x = -this.width / 2;
        let y = -this.height / 2;
        let w = this.width;
        let h = this.height;
        this.path = new Path2D();
        this.path.moveTo(x + radius, y);
        this.path.lineTo(x + w - radius, y);
        this.path.quadraticCurveTo(x + w, y, x + w, y + radius);
        this.path.lineTo(x + w, y + h - radius);
        this.path.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        this.path.lineTo(x + radius, y + h);
        this.path.quadraticCurveTo(x, y + h, x, y + h - radius);
        this.path.lineTo(x, y + radius);
        this.path.quadraticCurveTo(x, y, x + radius, y);
        this.path.closePath();
    }

    testCollision(ball) {
        const ballLeft = ball.x - ball.radius;
        const ballRight = ball.x + ball.radius;
        const ballTop = ball.y - ball.radius;
        const ballBottom = ball.y + ball.radius;

        const rectLeft = this.position.x - this.width / 2;
        const rectRight = this.position.x + this.width / 2;
        const rectTop = this.position.y - this.height / 2;
        const rectBottom = this.position.y + this.height / 2;

        return (
            ballRight > rectLeft &&
            ballLeft < rectRight &&
            ballBottom > rectTop &&
            ballTop < rectBottom
        );
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Shadow
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.filter = 'blur(2px)';
        ctx.fillStyle = '#222';
        ctx.translate(0, this.height * 0.08);
        ctx.fill(this.path);
        ctx.filter = 'none';
        ctx.restore();

        // Vertical gradient for 3D effect (top to bottom)
        const grad = ctx.createLinearGradient(
        0, -this.height / 2,
        0, this.height / 2
        );
        grad.addColorStop(0, OBSTACLE_HIGHLIGHT); // highlight
        grad.addColorStop(0.18, this.color);      // main color
        grad.addColorStop(1, OBSTACLE_SHADOW);    // shadow

        ctx.fillStyle = grad;
        ctx.fill(this.path);

        ctx.restore();
    }
}

class Circle {
    constructor(radius, canvas) {
        this.radius = radius * canvas.width;

        this.color = OBSTACLE_COLOR;
        this.position = { x: 0, y: 0 };
    }

    testCollision(ball) {
        const dx = this.position.x - ball.x;
        const dy = this.position.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + ball.radius;   
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Shadow
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(
        0, this.radius * 0.55,
        this.radius * 0.95,
        this.radius * 0.35,
        0, 0, Math.PI * 2
        );
        ctx.fillStyle = '#222';
        ctx.filter = 'blur(2px)';
        ctx.fill();
        ctx.filter = 'none';
        ctx.restore();

        // Radial gradient for 3D effect
        const grad = ctx.createRadialGradient(
        -this.radius * 0.4, -this.radius * 0.4, this.radius * 0.2,
        0, 0, this.radius
        );
        grad.addColorStop(0, OBSTACLE_HIGHLIGHT); // highlight
        grad.addColorStop(0.3, this.color);       // main color
        grad.addColorStop(1, OBSTACLE_SHADOW);    // shadow

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.restore();
    }
}