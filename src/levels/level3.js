const canvas = document.getElementById("gameCanvas");
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const ctx = canvas.getContext('2d');
const game = new Game2(canvas);

let holes = [
    { x: 0.4, y: 0.1, radius: 0.02 }
];
holes = holes.map(hole => toCanvasCircle(hole, canvas));
game.setHoles(holes);


let fractureObject = new Voronoi(20, game.canvas.width / 3, game.canvas.height / 3);
fractureObject.getImage();



game.fracture = fractureObject;


const toggleVisualizationButton = document.getElementById('toggleVisualizationButton');
toggleVisualizationButton.addEventListener('click', () => {
    if (!fractureObject.displayPoints && !fractureObject.displayDistanceField) {
        fractureObject.displayPoints = true;
    }
    else if (fractureObject.displayPoints && !fractureObject.displayDistanceField) {
        fractureObject.displayDistanceField = true;
    }
    else if (fractureObject.displayPoints && fractureObject.displayDistanceField) {
        fractureObject.displayPoints = false;
    }
    else if (!fractureObject.displayPoints && fractureObject.displayDistanceField) {
        fractureObject.displayDistanceField = false;
    }
});

const toggleNoiseButton = document.getElementById('toggleNoiseButton');
toggleNoiseButton.addEventListener('click', () => {

    if (fractureObject.noiseOverlay) {
        toggleNoiseButton.innerText = 'Toggle Noise-Overlay \n Currently: No Noise';
    }
    else {
        toggleNoiseButton.innerText = 'Toggle Noise-Overlay \n Currently: With Noise';
    }
    fractureObject.noiseOverlay = !fractureObject.noiseOverlay;

});

game.start();