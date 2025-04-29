const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const game = new Game(10, canvas);

const holes = [ 
    { x: 400, y: 100, radius: 20 }  
];
game.setHoles(holes);

const backAndForthPoints = [
    { x: 100, y: 300 },
    { x: 100, y: 300 },
    { x: 700, y: 300 },
    { x: 700, y: 300 }
];

const wavePoints = [
    { x: 100, y: 100 },
    { x: 200, y: 200 },
    { x: 300, y: 100 },
    { x: 400, y: 200 },
    { x: 500, y: 100 },
    { x: 600, y: 200 },
    { x: 700, y: 100 }
];

const splines = [
    new Spline(backAndForthPoints, 0.5),
    new Spline(wavePoints, 0.5)
];

game.addUpdate((delta) => {
    splines.forEach(spline => spline.update(delta));
});

game.addRender((ctx) => {
    splines.forEach(spline => spline.render(ctx));
});

// Controls
const updateRateControl = document.getElementById('updateRateControl');
const updateRateValue = document.getElementById('updateRateValue');

updateRateControl.addEventListener('input', () => {
    const newRate = parseInt(updateRateControl.value, 10);
    game.animationRate = newRate; 
    updateRateValue.textContent = newRate;
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

game.loop();