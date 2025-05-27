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
    { x: 0.25, y: 0.25, radius: 0.02 }  
];
holes = holes.map(hole => toCanvasCircle(hole, canvas));
game.holes = holes;

let playableArea = [
    { x: 0.42, y: 0.9 },
    { x: 0.58, y: 0.9 },
    { x: 0.58, y: 0.1 },
    { x: 0.2, y: 0.1 },
    { x: 0.2, y: 0.4 },
    { x: 0.42, y: 0.4 }
];
playableArea = playableArea.map(p => toCanvasCoords(p, canvas));
game.playableArea = createRoundedPolygonPath(playableArea, 0.015 * canvas.width);

let points1 = [
    { x: 0.44, y: 0.7 },
    { x: 0.44, y: 0.7 },
    { x: 0.56, y: 0.7 },
    { x: 0.56, y: 0.7 }
];

let points2 = [
    { x: 0.14, y: 0.14 },
    { x: 0.28, y: 0.28 },
    { x: 0.42, y: 0.14 },
    { x: 0.57, y: 0.28 },
    { x: 0.71, y: 0.14 },
    { x: 0.85, y: 0.28 },
    { x: 1.0,  y: 0.14 }
];

const object1 = new Rectangle(0.04, 0.02, canvas);
const object2 = new Circle(0.02, canvas);

points1 = points1.map(p => toCanvasCoords(p, canvas));
points2 = points2.map(p => toCanvasCoords(p, canvas));

const splines = [
    new Spline(points1, object1, 0.01, false),
    new Spline(points2, object2, 0.01)
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