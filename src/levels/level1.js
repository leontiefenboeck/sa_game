function startLevel1(canvas, ctx) {
    initSpline(); 
  
    const oldGameLoop = gameLoop;
    gameLoop = function(ctx) {
      oldGameLoop(ctx);
      updateSplineObjects();
      drawSplineObjects(ctx); 
    }
}
  