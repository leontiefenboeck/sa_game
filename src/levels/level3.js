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


let fractureObject = new Voronoi(20);
fractureObject.getImage();
fractureObject.createPoints(game.canvas.width/3, game.canvas.height/3);
fractureObject.computeVoronoiDiagram();
fractureObject.createMesh();

game.fracture = fractureObject;

game.start();