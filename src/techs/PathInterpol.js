let splineObjects = [];

function initSpline(objects) {
  splineObjects = objects.map(obj => ({
    points: obj.points, // Spline points for this object
    t: obj.t || 0,      // Initial t value
    loop: obj.loop || false, // Whether the object loops or moves back and forth
    speed: obj.speed || 0.005, // Speed of the object
  }));
}

function updateSplineObjects() {
  splineObjects.forEach(obj => {
    if (obj.loop) {
      obj.t += obj.speed;
      if (obj.t > 1) obj.t = 0; // Loop back to the start
    } else {
      obj.t += obj.speed;
      if (obj.t > 1) {
        obj.t = 1;
        obj.speed = -Math.abs(obj.speed); // Reverse direction
      } else if (obj.t < 0) {
        obj.t = 0;
        obj.speed = Math.abs(obj.speed); // Reverse direction
      }
    }
  });
}

function drawSplineObjects(ctx) {
  ctx.fillStyle = 'red';
  splineObjects.forEach(obj => {
    const pos = interpolateSpline(obj.t, obj.points);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  });
}

function interpolateSpline(t, points) {
  // Determine which segment of the spline we're in
  const segmentCount = points.length - 3; // Number of segments
  const segment = Math.min(Math.floor(t * segmentCount), segmentCount - 1); // Current segment index
  const localT = (t * segmentCount) - segment; // Local t within the segment

  // Get the four control points for this segment
  const p0 = points[segment];
  const p1 = points[segment + 1];
  const p2 = points[segment + 2];
  const p3 = points[segment + 3];

  const tt = localT * localT;
  const ttt = tt * localT;

  const q0 = -ttt + 2 * tt - localT;
  const q1 = 3 * ttt - 5 * tt + 2;
  const q2 = -3 * ttt + 4 * tt + localT;
  const q3 = ttt - tt;

  const x = 0.5 * (p0.x * q0 + p1.x * q1 + p2.x * q2 + p3.x * q3);
  const y = 0.5 * (p0.y * q0 + p1.y * q1 + p2.y * q2 + p3.y * q3);

  return { x, y };
}

function defineCircle(centerX, centerY, radius, segments) {
  const points = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }
  // Add extra points for smooth looping
  points.push(points[0]); // Repeat the first point at the end
  points.unshift(points[points.length - 2]); // Add the second-to-last point at the start
  points.push(points[1]); // Add the second point at the end

  return points;
}

// Expose public functions
window.initSpline = initSpline;
window.updateSplineObjects = updateSplineObjects;
window.drawSplineObjects = drawSplineObjects;
window.defineCircle = defineCircle;
