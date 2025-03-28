const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const path = [
    { x: 50, y: 50 },
    { x: 350, y: 50 },
    { x: 350, y: 350 },
    { x: 50, y: 350 }
];

let currentPoint = 0;
let x = path[0].x;
let y = path[0].y;
let speed = 2;

function move() {
    const target = path[currentPoint];
    const dx = target.x - x;
    const dy = target.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > speed) {
        x += (dx / dist) * speed;
        y += (dy / dist) * speed;
    } else {
        currentPoint = (currentPoint + 1) % path.length;
    }
}

function draw() {
    ctx.clearRect(1, 1, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    move();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();