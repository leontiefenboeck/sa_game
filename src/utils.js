// Vector functions
function sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}

function dot(a, b) {
    return a.x * b.x + a.y * b.y;
}

function cross(a, b) {
    return a.x * b.y - a.y * b.x;
}

function norm(v) {
    const length = Math.sqrt(v.x * v.x + v.y * v.y);
    return { x: v.x / length, y: v.y / length };
}

// get edges from corners of a polygon
function getEdges(corners) {
    const edges = [];
    for (let i = 0; i < corners.length; i++) {
        const next = (i + 1) % corners.length;
        edges.push(sub(corners[next], corners[i]));
    }
    return edges;
}

function projectPoints(points, axis) {
    let min = dot(points[0], axis);
    let max = min;
    for (let i = 1; i < points.length; i++) {
        const p = dot(points[i], axis);
        if (p < min) min = p;
        if (p > max) max = p;
    }
    return { min, max };
}

function overlap(proj1, proj2) {
    return proj1.max >= proj2.min && proj2.max >= proj1.min;
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

function drawArrow(ctx, from, to, color = 'red') {
    const headLength = 10;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // arrow head
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLength * Math.cos(angle - Math.PI / 6), to.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - headLength * Math.cos(angle + Math.PI / 6), to.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(to.x, to.y);
    ctx.fillStyle = color;
    ctx.fill();
}
