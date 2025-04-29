class Spline {
  constructor(points, traversalSpeed) {
      this.points = points; 
      this.traversalSpeed = traversalSpeed; 
      
      this.position = { x: 0, y: 0 };
      this.t = 0; 
      this.arcLengthTable = this.precomputeArcLengthTable();
      this.showVisualization = false;
  }

  toggleVisualization() { this.showVisualization = !this.showVisualization; }

  update(delta) {
    this.t += this.traversalSpeed * delta / 1000;
    if (this.t > 1) this.t = 0;

    const arcLengthT = this.mapArcLengthToT(this.t);
    this.position = this.evaluate(arcLengthT);
  }

  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();

    if (this.showVisualization) {
      this.renderVisualization(ctx);
    }
  }

  renderVisualization(ctx) {
    // Render the spline curve
    ctx.beginPath();
    for (let t = 0; t <= 1; t += 0.01) {
      const point = this.evaluate(t);
      if (t === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Render control points
    ctx.fillStyle = 'yellow';
    for (const point of this.points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render arc length samples
    ctx.fillStyle = 'orange';
    for (const entry of this.arcLengthTable) {
      const samplePoint = this.evaluate(entry.t);
      ctx.beginPath();
      ctx.arc(samplePoint.x, samplePoint.y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  evaluate(t) {
    const segmentCount = this.points.length - 3;
    const scaledT = t * segmentCount;
    const segmentIndex = Math.floor(scaledT);
    const localT = scaledT - segmentIndex;

    const p0 = this.points[Math.max(0, segmentIndex)];
    const p1 = this.points[Math.min(segmentIndex + 1, this.points.length - 1)];
    const p2 = this.points[Math.min(segmentIndex + 2, this.points.length - 1)];
    const p3 = this.points[Math.min(segmentIndex + 3, this.points.length - 1)];

    return this.interpolate(localT, p0, p1, p2, p3);
  }

  interpolate(t, p0, p1, p2, p3) {
    const tt = t * t;
    const ttt = tt * t;

    const q0 = -ttt + 2 * tt - t;
    const q1 = 3 * ttt - 5 * tt + 2;
    const q2 = -3 * ttt + 4 * tt + t;
    const q3 = ttt - tt;

    const x = 0.5 * (p0.x * q0 + p1.x * q1 + p2.x * q2 + p3.x * q3);
    const y = 0.5 * (p0.y * q0 + p1.y * q1 + p2.y * q2 + p3.y * q3);

    return { x, y };
  }

  mapArcLengthToT(arcLength) {
    for (let i = 1; i < this.arcLengthTable.length; i++) {
        const prev = this.arcLengthTable[i - 1];
        const current = this.arcLengthTable[i];

        if (arcLength >= prev.length && arcLength <= current.length) {
            const alpha = (arcLength - prev.length) / (current.length - prev.length);
            return prev.t + alpha * (current.t - prev.t);
        }
    }
    return 1; 
  }

  precomputeArcLengthTable(samples = 100) {
    const table = [];
    let totalLength = 0;

    let prevPoint = this.evaluate(0);
    for (let i = 1; i <= samples; i++) {
        const t = i / samples;
        const currentPoint = this.evaluate(t);
        const dx = currentPoint.x - prevPoint.x;
        const dy = currentPoint.y - prevPoint.y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);

        totalLength += segmentLength;
        table.push({ t, length: totalLength });
        prevPoint = currentPoint;
    }
    table.forEach(entry => entry.length /= totalLength);
    return table;
  }
}