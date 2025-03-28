const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 25,
    vx: 0,
    vy: 0,
    isDragging: false,
    startX: 0,
    startY: 0
};

function drawPlayer() {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Draw bounding box
function drawBounds() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!player.isDragging) {
        player.x += player.vx;
        player.y += player.vy;

        // Apply friction
        player.vx *= 0.98;
        player.vy *= 0.98;

        // Bounding box collisions
        if (player.x - player.radius < 0) {
            player.x = player.radius;
            player.vx *= -0.7;
        }
        if (player.x + player.radius > canvas.width) {
            player.x = canvas.width - player.radius;
            player.vx *= -0.7;
        }
        if (player.y - player.radius < 0) {
            player.y = player.radius;
            player.vy *= -0.7;
        }
        if (player.y + player.radius > canvas.height) {
            player.y = canvas.height - player.radius;
            player.vy *= -0.7;
        }
    }

    drawBounds();
    drawPlayer();
    requestAnimationFrame(update);
}

// Mouse event handlers
canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - player.x;
    const dy = mouseY - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= player.radius) {
        player.isDragging = true;
        player.startX = mouseX;
        player.startY = mouseY;

        // Stop movement while dragging
        player.vx = 0;
        player.vy = 0;
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (player.isDragging) {
        const rect = canvas.getBoundingClientRect();
        player.x = e.clientX - rect.left;
        player.y = e.clientY - rect.top;
    }
});

canvas.addEventListener("mouseup", (e) => {
    if (player.isDragging) {
        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        player.vx = (player.startX - endX) * 0.2;
        player.vy = (player.startY - endY) * 0.2;

        player.isDragging = false;
    }
});

update();
