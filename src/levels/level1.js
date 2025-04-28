console.log('loading Level 1');

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

const holes = [ 
    { x: 400, y: 100, radius: 30 }  
];
game.setHoles(holes);
game.start();

const backAndForthPoints = [
    { x: 100, y: 300 },
    { x: 100, y: 300 },
    { x: 700, y: 300 },
    { x: 700, y: 300 }
];

const spline = new Spline(backAndForthPoints, 0, 0.005);

game.addAnimation((ctx) => {
    spline.animate(ctx);
});

