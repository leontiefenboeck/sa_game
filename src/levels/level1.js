const canvas = document.getElementById('gameCanvas');
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
const ctx = canvas.getContext('2d');

const game = new Game(canvas);

let ball = new RigidBall(toCanvasCoords({x: 0.5, y: 0.8}, canvas), 0.015 * canvas.width);
game.ball = ball;

let hole = { x: 0.25, y: 0.25, radius: 0.02 };
game.hole = toCanvasCircle(hole, canvas);

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

// splines 

let points1 = [
    { x: 0.25, y: 0.13 },
    { x: 0.25, y: 0.13 },
    { x: 0.53, y: 0.13 },
    { x: 0.53, y: 0.13 }
].map(p => toCanvasCoords(p, canvas));

let points2 = [
    { x: 0.56, y: 0.25 },
    { x: 0.56, y: 0.25 },
    { x: 0.56, y: 0.4 },
    { x: 0.56, y: 0.4 }
].map(p => toCanvasCoords(p, canvas));

let points3 = [
    { x: 0.25, y: 0.35 },
    { x: 0.25, y: 0.35 },
    { x: 0.35, y: 0.35 },
    { x: 0.35, y: 0.35 }
].map(p => toCanvasCoords(p, canvas));

let points4 = [
    { x: 0, y: 0.6 },
    { x: 0, y: 0.6 },
    { x: 0.1, y: 0.5 },
    { x: 0.3, y: 0.6 },
    { x: 0.5, y: 0.5 },
    { x: 0.7, y: 0.6 },
    { x: 0.9, y: 0.5 },
    { x: 1, y: 0.6 },
    { x: 1, y: 0.6 }
].map(p => toCanvasCoords(p, canvas));

const object1 = new KinematicRectangleBody({x: 0, y: 0}, 0.06 * canvas.width, 0.02 * canvas.height);
const object2 = new KinematicRectangleBody({x: 0, y: 0}, 0.06 * canvas.width, 0.02 * canvas.height, Math.PI / 2);
const object3 = new KinematicRectangleBody({x: 0, y: 0}, 0.06 * canvas.width, 0.02 * canvas.height);
const object4 = new KinematicCircleBody({x: 0, y: 0}, 0.02 * canvas.width);

game.splines = [
    new Spline(points1, object1, false, true),
    new Spline(points2, object2, false),
    new Spline(points3, object3, false),
    new Spline(points4, object4, true, false, 0.3),
];

// rigid bodies
game.rigidBodies = [
    ball,
    object1,
    object2,
    object3,
    object4,
    new RectangleBody(toCanvasCoords({x: 0.6, y: 0.7}, canvas), 0.03 * canvas.width, 0.04 * canvas.height, 0, {x: -10, y: 0}),
    new RectangleBody(toCanvasCoords({x: 0.4, y: 0.73}, canvas), 0.03 * canvas.width, 0.04 * canvas.height, 0, {x: 10, y: 0}),
    new RectangleBody(toCanvasCoords({x: 0.6, y: 0.6}, canvas), 0.03 * canvas.width, 0.04 * canvas.height, 0, {x: -10, y: 0}),
    new RectangleBody(toCanvasCoords({x: 0.4, y: 0.63}, canvas), 0.03 * canvas.width, 0.04 * canvas.height, 0, {x: 10, y: 0}),
]

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
speedValue.textContent = 0.5;
speedControl.value = 0.5;

speedControl.addEventListener('input', () => {
    const speed = parseFloat(speedControl.value);
    game.splines.forEach(spline => spline.traversalSpeed = speed);
    speedValue.textContent = speed.toFixed(3); 
});

const toggleVisualizationButton = document.getElementById('toggleVisualizationButton');
toggleVisualizationButton.addEventListener('click', () => {
    game.splines.forEach(spline => spline.toggleVisualization());
    game.rigidBodies.forEach(body => body.toggleVisualization());
});

game.start();