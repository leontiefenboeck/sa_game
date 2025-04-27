function startLevel(levelNumber) {
    document.getElementById('main-menu').style.display = 'none';
    const canvas = document.getElementById('gameCanvas');
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
  
    startCoreGame(canvas, ctx); 
  
    if (levelNumber === 1) {
      startLevel1(canvas, ctx);
    } else if (levelNumber === 2) {
      startLevel2(canvas, ctx);
    }
  }
  