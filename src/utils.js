function createRoundedPolygonPath(points, cornerRadius) {
    if (!points || points.length < 2) return null;
    const path = new Path2D();
    for (let i = 0; i < points.length; i++) {
        const prev = points[(i - 1 + points.length) % points.length];
        const curr = points[i];
        const next = points[(i + 1) % points.length];
        const v1x = curr.x - prev.x;
        const v1y = curr.y - prev.y;
        const v2x = next.x - curr.x;
        const v2y = next.y - curr.y;
        const len1 = Math.hypot(v1x, v1y);
        const len2 = Math.hypot(v2x, v2y);
        const r = Math.min(cornerRadius, len1 / 2, len2 / 2);
        const startX = curr.x - (v1x / len1) * r;
        const startY = curr.y - (v1y / len1) * r;
        const endX = curr.x + (v2x / len2) * r;
        const endY = curr.y + (v2y / len2) * r;
        if (i === 0) {
            path.moveTo(startX, startY);
        } else {
            path.lineTo(startX, startY);
        }
        path.arcTo(curr.x, curr.y, endX, endY, r);
    }
    path.closePath();
    return path;
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
        radius: circle.radius * canvas.width 
    };
}
