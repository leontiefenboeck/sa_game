class Spline {
    constructor(points, object, loop = true, useEasing = false, traversalSpeed = 0.5) {
        this.points = points; 
        this.object = object;
        this.traversalSpeed = traversalSpeed; 
        this.useEasing = useEasing;
        this.loop = loop;

        this.numSegments = points.length - 3;

        this.s = 0; 
        this.direction = 1;
        this.arcLengthTable = this.precomputeArcLengthTable();
        this.showVisualization = false;
    }

    toggleVisualization() { this.showVisualization = !this.showVisualization; }

    update(dt) {
        if (this.loop) {
        this.s += this.traversalSpeed * dt;
        if (this.s > 1) this.s = 0;
        } else {
        this.s += this.traversalSpeed * this.direction * dt;
        if (this.s > 1) {
            this.s = 1;
            this.direction = -1;
        } else if (this.s < 0) {
            this.s = 0;
            this.direction = 1;
        }
        }

        const prevPos = { ...this.object.position }; // creates a copy -- weird syntax

        const t = this.mapArcLengthToT(this.useEasing ? this.easeInOut(this.s) : this.s);
        const pos = this.evaluate(t);

        this.object.position.x = pos.x;
        this.object.position.y = pos.y;
        this.object.linearMomentum.x = (this.object.position.x - prevPos.x) * this.object.mass / dt;
        this.object.linearMomentum.y = (this.object.position.y - prevPos.y) * this.object.mass / dt;
    }

    render(ctx) {
        if (this.showVisualization) this.renderVisualization(ctx);
    }

    evaluate(t) {
        const scaledT = t * this.numSegments; 
        const segmentIndex = Math.floor(scaledT); // for 4 points always the same
        const localT = scaledT - segmentIndex;

        const p0 = this.points[segmentIndex];
        const p1 = this.points[segmentIndex + 1];
        const p2 = this.points[segmentIndex + 2];
        const p3 = this.points[segmentIndex + 3];

        return this.interpolate(localT, p0, p1, p2, p3);
    }

    interpolate(t, p0, p1, p2, p3) {
        return { 
            x: this.catmullrom(t, p0.x, p1.x, p2.x, p3.x),
            y: this.catmullrom(t, p0.y, p1.y, p2.y, p3.y)
        };
    }

    catmullrom(t, p0, p1, p2, p3) { // copied from slides
        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
        );
    }

    mapArcLengthToT(s) {
        if (s <= 0) return 0;
        if (s >= 1) return 0.999; // to avoid out of bounds

        for (let i = 1; i < this.arcLengthTable.length; i++) {
            const prev = this.arcLengthTable[i - 1];
            const current = this.arcLengthTable[i];

            if (s >= prev.length && s <= current.length) {
                const alpha = (s - prev.length) / (current.length - prev.length) // interpolate between lengths
                return prev.t + alpha * (current.t - prev.t); // interpolate between t values 
            }
        }
        return 0;
    }

    precomputeArcLengthTable(samples = 100) {
        const table = [];
        let totalLength = 0;
        let prev = this.evaluate(0);

        for (let i = 1; i < samples; i++) {
            const t = i / samples;
            const current = this.evaluate(t);
            const dx = current.x - prev.x;
            const dy = current.y - prev.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            totalLength += length;
            table.push({ t, length: totalLength });
            prev = current;
        }

        table.forEach(entry => entry.length /= totalLength); // normalize lenghts
        return table;
    }

    easeInOut(s) {
        return 0.5 * (1 - Math.cos(Math.PI * s));
    }

  renderVisualization(ctx) {
    // spline curve
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

    // control points
    ctx.fillStyle = 'yellow';
    for (const point of this.points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // arc length samples
    ctx.fillStyle = 'orange';
    for (const entry of this.arcLengthTable) {
      const samplePoint = this.evaluate(entry.t);
      ctx.beginPath();
      ctx.arc(samplePoint.x, samplePoint.y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}