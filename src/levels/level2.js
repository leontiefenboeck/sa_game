import * as particleScript from '../techs/ParticleDynamics.js'
import { Vector2 } from '../Vector.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const h = 10;


let player = new particleScript.Particle(new Vector2(canvas.width / 2 + 41, canvas.height - 48), 1);
let obstacle1 = new particleScript.Particle(new Vector2(canvas.width * 2 / 3 + 35, canvas.height - 135), 1000);
let obstacle2 = new particleScript.Particle(new Vector2(canvas.width *6/ 7 + 43, canvas.height - 289), 1000);
let obstacle3 = new particleScript.Particle(new Vector2(canvas.width * 1 / 4 + 12, canvas.height - 380), 1000);
let obstacle4 = new particleScript.Particle(new Vector2(canvas.width *3/ 5 + 13, canvas.height - 512), 1000);
obstacle2.attract = false;
obstacle3.attract = false;
const particles = [];
particles.push(player);
particles.push(obstacle1);
particles.push(obstacle2);
particles.push(obstacle3);
particles.push(obstacle4);


function drawParticles() {

    for (let obj of particles) {
        if (obj == player) {
            ctx.fillStyle = "blue";
        }
        else if (obj.attract) {
            ctx.fillStyle = "green";
        }
        else {
            ctx.fillStyle = "red";
        }
        
        ctx.beginPath();
        ctx.arc(obj.location.x, obj.location.y, obj.radius, 0, Math.PI * 2);
        ctx.fill();
        particleScript.visualize(ctx, particles, true, true);
    }
}

// Draw bounding box
function drawBounds() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function drawEverything(){
    drawBounds();
    drawParticles();
}


function update(deltaTime) {



    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEverything();
    if (!player.active) {
        return;
    }

    //particleScript.euler(particles, deltaTime);
    particleScript.RK4(particles, deltaTime);
        
    // Bounding box collisions
    if (player.location.x - player.radius < 0) {
        player.location.x = player.radius;
        player.speed.x *= -0.7;
    }
    if (player.location.x + player.radius > canvas.width) {
        player.location.x = canvas.width - player.radius;
        player.speed.x *=-0.7;
    }
    if (player.location.y - player.radius < 0) {
        player.location.y = player.radius;
        player.speed.y *= -0.7;
    }
    if (player.location.y + player.radius > canvas.height) {
        player.location.y = canvas.height - player.radius;
        player.speed.y *= -0.7;
        }


}

// Mouse event handlers
canvas.addEventListener("mousedown", (e) => {
    if (player.active) {
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - player.location.x;
    const dy = mouseY - player.location.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= player.radius) {
        player.isDragging = true;
        player.startX = mouseX;
        player.startY = mouseY;

        // Stop movement while dragging
        player.speed = 0;
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (player.isDragging && !player.active) {
        const rect = canvas.getBoundingClientRect();

    }
});

window.addEventListener("mouseup", (e) => {
    if (player.isDragging && !player.active) {
        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        player.speed = new Vector2((player.startX - endX) * 0.1, (player.startY - endY) * 0.1);
        player.isDragging = false;
        player.active = true;
    }
});



let lastTime = performance.now();
function mainLoop(currentTime) {
    let deltaTime = (currentTime - lastTime);

    lastTime = currentTime;

    update(deltaTime);


    requestAnimationFrame(mainLoop);
}


requestAnimationFrame(mainLoop);