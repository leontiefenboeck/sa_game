// specials/spline.js

let splineObjects = [];

function initSpline() {
  splineObjects = [{ t: 0 }];
}

function updateSplineObjects() {
  splineObjects.forEach(obj => {
    obj.t += 0.005; // Smaller step for smoother movement
    if (obj.t > 1) obj.t = 0;
  });
}

function drawSplineObjects(ctx) {
  ctx.fillStyle = 'red';
  splineObjects.forEach(obj => {
    const pos = getCatmullRomPoint(obj.t, [
      {x:100,y:100},
      {x:300,y:200},
      {x:500,y:400},
      {x:700,y:100}
    ]);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });
}

function getCatmullRomPoint(t, points) {
  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];
  const p3 = points[3];

  const tt = t * t;
  const ttt = tt * t;

  const q0 = -ttt + 2*tt - t;
  const q1 = 3*ttt - 5*tt + 2;
  const q2 = -3*ttt + 4*tt + t;
  const q3 = ttt - tt;

  const x = 0.5 * (p0.x*q0 + p1.x*q1 + p2.x*q2 + p3.x*q3);
  const y = 0.5 * (p0.y*q0 + p1.y*q1 + p2.y*q2 + p3.y*q3);

  return {x, y};
}

// Expose public functions
window.initSpline = initSpline;
window.updateSplineObjects = updateSplineObjects;
window.drawSplineObjects = drawSplineObjects;
