class Spline {
  constructor(points, t = 0, speed = 0.005) {
    this.points = points; 
    this.t = t;          
    this.speed = speed;  
    this.arcLengthTable = this.computeArcLengthTable(100);
  }

  animate(ctx) {
    this.update();
    this.draw(ctx);
  }

  update() {
    const totalLength = this.arcLengthTable[this.arcLengthTable.length - 1].length;
    const currentArcLength = (this.t * totalLength + this.speed * totalLength) % totalLength;
    this.t = this.getTFromArcLength(currentArcLength);
  }

  draw(ctx) {
    ctx.fillStyle = 'red';
    const pos = this.interpolate(this.t, this.points);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  interpolate(t, points) { 
    const segmentCount = points.length - 3;
    const segment = Math.min(Math.floor(t * segmentCount), segmentCount - 1);
    const localT = (t * segmentCount) - segment;

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

  computeArcLengthTable(segments) {
    const table = [];
    let totalLength = 0;
  
    for (let i = 0; i <= segments; i++) {
      const t = i / segments; // Divide t into equal segments
      const pos = this.interpolate(t, this.points); // Get position on the curve
  
      if (i > 0) {
        const prevPos = this.interpolate((i - 1) / segments, this.points); // Previous position
        const segmentLength = Math.sqrt(
          Math.pow(pos.x - prevPos.x, 2) + Math.pow(pos.y - prevPos.y, 2) // Euclidean distance
        );
        totalLength += segmentLength; // Accumulate arc length
      }
  
      table.push({ t, length: totalLength }); 
    }
    return table; 
  }

  getTFromArcLength(arcLength) {
    const table = this.arcLengthTable;

    for (let i = 1; i < table.length; i++) {
      if (arcLength <= table[i].length) {
        const prev = table[i - 1];
        const next = table[i];

        const ratio = (arcLength - prev.length) / (next.length - prev.length);
        return prev.t + ratio * (next.t - prev.t);
      }
    }

    return 1; 
  }

}