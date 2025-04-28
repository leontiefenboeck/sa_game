const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const game = new Game(10, canvas);

const holes = [ 
    { x: 400, y: 100, radius: 30 }  
];
game.setHoles(holes);

const backAndForthPoints = [
    { x: 100, y: 300 },
    { x: 100, y: 300 },
    { x: 700, y: 300 },
    { x: 700, y: 300 }
];

const spline = new Spline(backAndForthPoints, 0.5);

game.addUpdate((delta) => {
    spline.update(delta);
});
game.addRender((ctx) => {
    spline.render(ctx);
});

game.loop();
