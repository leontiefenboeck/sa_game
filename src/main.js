const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Set canvas to fill the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Circle properties
let circle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 100,
    color: 'red',
    speed: 5
};

// Draw the circle
function drawCircle() {
    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    context.fillStyle = circle.color;
    context.fill();
    context.closePath();
}

// Handle keyboard input
let keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update circle position based on input
function updateCirclePosition() {
    if (keys['ArrowUp'] && circle.y - circle.radius > 0) {
        circle.y -= circle.speed;
    }
    if (keys['ArrowDown'] && circle.y + circle.radius < canvas.height) {
        circle.y += circle.speed;
    }
    if (keys['ArrowLeft'] && circle.x - circle.radius > 0) {
        circle.x -= circle.speed;
    }
    if (keys['ArrowRight'] && circle.x + circle.radius < canvas.width) {
        circle.x += circle.speed;
    }
}

// Game loop
function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    updateCirclePosition();
    drawCircle();
    requestAnimationFrame(gameLoop);
}