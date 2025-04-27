let ball = {
    x: 400,
    y: 300,
    radius: 15,
    vx: 0,
    vy: 0
};

let isDragging = false;
let dragStart = {x: 0, y: 0};

function startCoreGame(canvas, ctx) {
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStart = {x: e.offsetX, y: e.offsetY};
    });

    canvas.addEventListener('mouseup', (e) => {
        if (isDragging) {
        const dragEnd = {x: e.offsetX, y: e.offsetY};
        ball.vx = (dragStart.x - dragEnd.x) * 0.1;
        ball.vy = (dragStart.y - dragEnd.y) * 0.1;
        isDragging = false;
        }
    });

    requestAnimationFrame(() => gameLoop(ctx));
}

function gameLoop(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Update ball
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= 0.98; // friction
    ball.vy *= 0.98;

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();

    requestAnimationFrame(() => gameLoop(ctx));
}
  