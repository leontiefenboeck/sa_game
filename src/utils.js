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

function checkCircleCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (a.radius + b.radius);
}

function toCanvasCoords(point, canvas) {
    return {
        x: point.x * canvas.width,
        y: point.y * canvas.height
    };
}

function toCanvasCircle(circle, canvas) {
    return {
        x: circle.x * canvas.width,
        y: circle.y * canvas.height,
        radius: circle.radius * canvas.width // or use Math.min(canvas.width, canvas.height)
    };
}
