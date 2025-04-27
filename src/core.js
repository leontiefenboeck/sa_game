let isGameRunning = true;

let isDragging = false;
let dragStart = { x: 0, y: 0 };
let goalCircles = []; 

let ball = {
    x: 400,
    y: 580,
    radius: 15,
    vx: 0,
    vy: 0
};

function setGoalCircles(goals) { goalCircles = goals; }

function checkGoalCollision(ball) {
    for (const goal of goalCircles) {
        const dx = ball.x - goal.x;
        const dy = ball.y - goal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.radius + goal.radius) {
            isGameRunning = false;
            displayLevelCompleteMessage();
            return true;
        }
    }
    return false;
}

function startCoreGame(canvas, ctx) {
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStart = { x: e.offsetX, y: e.offsetY };
    });

    canvas.addEventListener('mouseup', (e) => {
        if (isDragging) {
            const dragEnd = { x: e.offsetX, y: e.offsetY };
            ball.vx = (dragStart.x - dragEnd.x) * 0.1;
            ball.vy = (dragStart.y - dragEnd.y) * 0.1;
            isDragging = false;
        }
    });

    requestAnimationFrame(() => gameLoop(ctx));
}

function updateBall(ball, canvasWidth, canvasHeight) {
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= 0.98; 
    ball.vy *= 0.98;

    // boundary
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -1;
    }
    if (ball.x + ball.radius > canvasWidth) {
        ball.x = canvasWidth - ball.radius;
        ball.vx *= -1;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -1;
    }
    if (ball.y + ball.radius > canvasHeight) {
        ball.y = canvasHeight - ball.radius;
        ball.vy *= -1;
    }

    checkGoalCollision(ball);
}

function drawBall(ctx, ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
}

function drawGoalCircles(ctx) {
    ctx.fillStyle = 'green';
    goalCircles.forEach(goal => {
        ctx.beginPath();
        ctx.arc(goal.x, goal.y, goal.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });
}

function displayLevelCompleteMessage() {
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; 
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);

    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Level Completed!`, canvas.width / 2, canvas.height / 2);
}

// TODO: make this better for level game loops
function gameLoop(ctx) {
    if (!isGameRunning) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    drawGoalCircles(ctx);
    updateBall(ball, ctx.canvas.width, ctx.canvas.height);
    drawBall(ctx, ball);

    requestAnimationFrame(() => gameLoop(ctx));
}