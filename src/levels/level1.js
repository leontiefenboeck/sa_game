function startLevel1(canvas, ctx) {
    const goals = [
      { x: 200, y: 200, radius: 30 }, 
      { x: 600, y: 400, radius: 30 }  
    ];
    setGoalCircles(goals);
    
    const circlePoints = defineCircle(400, 300, 150, 20);
    const backAndForthPoints = [
        { x: 100, y: 300 },
        { x: 100, y: 300 },
        { x: 700, y: 300 },
        { x: 700, y: 300 }
    ];

    initSpline([
        { points: circlePoints, t: 0, loop: true }, 
        { points: backAndForthPoints, t: 0, speed: 0.01, loop: false }, 
    ]);

    const oldGameLoop = gameLoop;
    gameLoop = function(ctx) {
        oldGameLoop(ctx);
        updateSplineObjects();
        drawSplineObjects(ctx);
    };
}
