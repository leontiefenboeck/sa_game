const canvas = document.getElementById("gameCanvas");
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const ctx = canvas.getContext('2d');
const game = new Game(canvas);

let holes = [
    { x: 0.4, y: 0.1, radius: 0.02 }
];
holes = holes.map(hole => toCanvasCircle(hole, canvas));
game.setHoles(holes);



let player = new Particle(new Vector2(game.ball.x, game.ball.y), 1);
player.isPlayer = true
player.radius = game.ball.radius;
player.ball = game.ball;
player.ball.particle = player;

let obstacle1 = new Particle(new Vector2(canvas.width * 2 / 3 + 35, canvas.height - 135), 1000);
let obstacle2 = new Particle(new Vector2(canvas.width *6/ 7 + 43, canvas.height - 289), 1000);
let obstacle3 = new Particle(new Vector2(canvas.width * 1 / 4 + 12, canvas.height - 380), 1000);
let obstacle4 = new Particle(new Vector2(canvas.width *3/ 5 + 13, canvas.height - 512), 1000);
obstacle2.attract = false;
obstacle3.attract = false;

game.particles.push(player);
game.particles.push(obstacle1);
game.particles.push(obstacle2);
game.particles.push(obstacle3);
game.particles.push(obstacle4);

const updateRateControl = document.getElementById('updateRateControl');
const updateRateValue = document.getElementById('updateRateValue');

updateRateControl.addEventListener('input', () => {
    const newRate = parseInt(updateRateControl.value, 10);
    game.animationRate = newRate;
    updateRateValue.textContent = newRate;
});

const toggleVisualizationButton = document.getElementById('toggleVisualizationButton');
toggleVisualizationButton.addEventListener('click', () => {
    if (!player.visTrail && !player.visArrows) {
        player.visTrail = true;
    }
    else if (player.visTrail && !player.visArrows) {
        player.visArrows = true;
    }
    else if (player.visTrail && player.visArrows) {
        player.visTrail = false;
    }
    else if (!player.visTrail && player.visArrows) {
        player.visArrows = false;
    }
});

const toggleIntegrationButton = document.getElementById('toggleIntegrationButton');
toggleIntegrationButton.addEventListener('click', () => {
    
    if (player.integration) {
        toggleIntegrationButton.innerText = 'Toggle Integration\n Currently: RK4';
    }
    else {
        toggleIntegrationButton.innerText = 'Toggle Integration\n Currently: Euler';
    }
    player.integration = !player.integration;
    
});

game.start();