const canvas = document.getElementById('gameCanvas');
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

const object1 = new splineObject(0.02, 'yellow', 'rect');
const object2 = new splineObject(0.02, 'blue');

wavePoints = wavePoints.map(p => toCanvasCoords(p, canvas));
backAndForthPoints = backAndForthPoints.map(p => toCanvasCoords(p, canvas));

const splines = [
    new Spline(backAndForthPoints, object1, 0.01, false),
    new Spline(wavePoints, object2, 0.01)
];

game.splines = splines;

// Controls
const fpsControl = document.getElementById('fpsControl');
const fpsDisplay = document.getElementById('fpsDisplay');
fpsDisplay.textContent = game.fps;
fpsControl.value = game.fps;

fpsControl.addEventListener('input', () => {
    const newRate = parseInt(fpsControl.value);
    game.setFps(newRate); 
    fpsDisplay.textContent = newRate;
});

const animationRateControl = document.getElementById('animationRateControl');
const animationRateDisplay = document.getElementById('animationRateDisplay');
animationRateDisplay.textContent = game.animationRate;
animationRateControl.value = game.animationRate;

animationRateControl.addEventListener('input', () => {
    const newRate = parseInt(animationRateControl.value);
    game.setAnimationRate(newRate);
    animationRateDisplay.textContent = newRate;
});

const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
speedValue.textContent = 0.01;
speedControl.value = 0.01;

speedControl.addEventListener('input', () => {
    const speed = parseFloat(speedControl.value);
    splines.forEach(spline => spline.traversalSpeed = speed);
    speedValue.textContent = speed.toFixed(3); 
});

const toggleVisualizationButton = document.getElementById('toggleVisualizationButton');
toggleVisualizationButton.addEventListener('click', () => {
    splines.forEach(spline => spline.toggleVisualization());
});

game.start();