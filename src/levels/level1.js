const canvas = document.getElementById('gameCanvas');
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const ctx = canvas.getContext('2d');
const game = new Game(60, 60, canvas);

let holes = [ 
    { x: 0.4, y: 0.1, radius: 0.02 }  
];
holes = holes.map(hole => toCanvasCircle(hole, canvas));
game.setHoles(holes);

let backAndForthPoints = [
    { x: 0.1, y: 0.3 },
    { x: 0.1, y: 0.3 },
    { x: 0.9, y: 0.3 },
    { x: 0.9, y: 0.3 }
];

let wavePoints = [
    { x: 0.14, y: 0.14 },
    { x: 0.28, y: 0.28 },
    { x: 0.42, y: 0.14 },
    { x: 0.57, y: 0.28 },
    { x: 0.71, y: 0.14 },
    { x: 0.85, y: 0.28 },
    { x: 1.0,  y: 0.14 }
];

const object1 = new GameObject(0.02, 'yellow', 'rect');
const object2 = new GameObject(0.02, 'blue');

wavePoints = wavePoints.map(p => toCanvasCoords(p, canvas));
backAndForthPoints = backAndForthPoints.map(p => toCanvasCoords(p, canvas));

const splines = [
    new Spline(backAndForthPoints, object1, 0.01),
    new Spline(wavePoints, object2, 0.01)
];

game.addUpdate((delta) => {
    splines.forEach(spline => spline.update(delta));
});

game.addRender((ctx) => {
    splines.forEach(spline => spline.render(ctx));
});

// Controls
const fps = document.getElementById('fpsControl');
const fpsDisplay = document.getElementById('fpsDisplay');

fps.addEventListener('input', () => {
    const newRate = parseInt(fps.value, 10);
    game.setFps(newRate); 
    fpsDisplay.textContent = newRate;
});

const animationRate = document.getElementById('animationRateControl');
const animationRateDisplay = document.getElementById('animationRateDisplay');

animationRate.addEventListener('input', () => {
    const newRate = parseInt(animationRate.value, 10);
    game.setAnimationRate(newRate);
    animationRateDisplay.textContent = newRate;
});

const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');

speedControl.addEventListener('input', () => {
    const speed = parseFloat(speedControl.value);
    splines.forEach(spline => spline.traversalSpeed = speed);
    speedValue.textContent = speed.toFixed(1); 
});

const toggleVisualizationButton = document.getElementById('toggleVisualizationButton');
toggleVisualizationButton.addEventListener('click', () => {
    splines.forEach(spline => spline.toggleVisualization());
});


// start the game loop
game.start();