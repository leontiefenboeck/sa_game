const RIGIDBODY_BOUNDINGBOX_COLOR = '#00fa43';
const RIGIDBODY_COLOR = 'rgb(248, 221, 47)';
const RIGIDBODY_COLOR_DARK = 'rgba(248, 221, 47, 0.65)';
const KINEMATIC_RIGIDBODY_COLOR = 'rgb(206, 24, 212)'; 
const KINEMATIC_RIGIDBODY_COLOR_DARK = 'rgba(206, 24, 212, 0.67)'; 
const RIGIDBODY_DENSITY = 0.0001; // to calculate mass and intertia, adjusted to need lower momenta

class RigidBody {
    constructor(position, rotation = 0, linearMomentum = {x: 0, y: 0}, angularMomentum = 0) {
        this.position = position; 
        this.rotation = rotation;
        this.linearMomentum = linearMomentum;
        this.angularMomentum = angularMomentum;

        this.showVisualization = false;
    }

    toggleVisualization() { this.showVisualization = !this.showVisualization; }

    update(dt) {
        const drag = 0.99;
        this.linearMomentum.x *= drag;
        this.linearMomentum.y *= drag;
        this.angularMomentum *= drag;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.rotation += this.angularVelocity * dt;
    }

    get velocity() {
        return {
            x: this.linearMomentum.x / this.mass,
            y: this.linearMomentum.y / this.mass
        };
    }

    get angularVelocity() {
        return this.angularMomentum / this.inertia;
    }

    renderVisualization(ctx) {
        // linear momentum
        const linearSpeedSq = this.linearMomentum.x ** 2 + this.linearMomentum.y ** 2;
        if (linearSpeedSq > 0.001) { 
            const momentumEnd = {
                x: this.position.x + this.linearMomentum.x * 5,
                y: this.position.y + this.linearMomentum.y * 5
            };
            drawArrow(ctx, this.position, momentumEnd, 'blue');
        }

        // angular momentum
        const magnitude = Math.abs(this.angularMomentum);
        if (magnitude > 0.001) {
            const baseRadius = 20; 
            const maxAngle = Math.PI ** 2; 
            const maxMomentum = 50; 

            const direction = Math.sign(this.angularMomentum); // -1 or +1
            const arcAngle = Math.min(maxAngle, magnitude / maxMomentum * maxAngle);

            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + direction * arcAngle;

            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.arc(this.position.x, this.position.y, baseRadius, startAngle, endAngle, direction < 0);
            ctx.stroke();
        }
    }
}

class RectangleBody extends RigidBody {
    constructor(position, width, height, rotation, linearMomentum, angularMomentum) {
        super(position, rotation, linearMomentum, angularMomentum);
        this.width = width;
        this.height = height;
        this.shape = 'rectangle';

        this.mass = RIGIDBODY_DENSITY * width * height; 
        this.inertia = (1/12) * this.mass * (this.width * this.width + this.height * this.height); // found https://en.wikipedia.org/wiki/List_of_moments_of_inertia
    }

    handleCollision(other) {
        if (other.shape === 'rectangle') {
            handleRectangleRectangleCollision(this, other);
        } else if (other.shape === 'circle') {
            handleRectanlgeCircleCollision(this, other);
        }
    }

    get corners() {
        const hw = this.width / 2;
        const hh = this.height / 2;
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);

        const cx = this.position.x;
        const cy = this.position.y;

        return [
            { x: cx + (-hw) * cos - (-hh) * sin, y: cy + (-hw) * sin + (-hh) * cos }, // top-left
            { x: cx + (hw) * cos - (-hh) * sin, y: cy + (hw) * sin + (-hh) * cos },   // top-right
            { x: cx + (hw) * cos - (hh) * sin, y: cy + (hw) * sin + (hh) * cos },     // bottom-right
            { x: cx + (-hw) * cos - (hh) * sin, y: cy + (-hw) * sin + (hh) * cos },   // bottom-left
        ];
    }

    getLocalPoint(worldPoint) {
        const cos = Math.cos(-this.rotation);
        const sin = Math.sin(-this.rotation);
        const dx = worldPoint.x - this.position.x;
        const dy = worldPoint.y - this.position.y;
        return {
            x: dx * cos - dy * sin,
            y: dx * sin + dy * cos
        };
    }

    getWorldPoint(localPoint) {
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);
        return {
            x: this.position.x + localPoint.x * cos - localPoint.y * sin,
            y: this.position.y + localPoint.x * sin + localPoint.y * cos
        };
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        // Gradient for 3D effect
        const gradient = ctx.createLinearGradient(-this.width/2, -this.height/2, this.width/2, this.height/2);
        gradient.addColorStop(0, this.kinematic ? KINEMATIC_RIGIDBODY_COLOR : RIGIDBODY_COLOR );
        gradient.addColorStop(1, this.kinematic ? KINEMATIC_RIGIDBODY_COLOR_DARK : RIGIDBODY_COLOR_DARK );
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Outline
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#123'; // dark outline
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();

        if (this.showVisualization) this.renderVisualization(ctx);
    }


    renderVisualization(ctx) {
        super.renderVisualization(ctx);
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = RIGIDBODY_BOUNDINGBOX_COLOR;
        ctx.stroke();
        ctx.restore();
    }
}

class CircleBody extends RigidBody {
    constructor(position, radius, rotation, linearMomentum, angularMomentum) {
        super(position, rotation, linearMomentum, angularMomentum);
        this.radius = radius;
        this.shape = 'circle';

        this.mass = RIGIDBODY_DENSITY * Math.PI * radius * radius;
        this.inertia = 0.5 * this.mass * this.radius * this.radius; // found https://en.wikipedia.org/wiki/List_of_moments_of_inertia
    }

    handleCollision(other) {
        if (other.shape === 'circle') {
            handleCircleCircleCollision(this, other);
        } else if (other.shape === 'rectangle') {
            handleRectanlgeCircleCollision(other, this);
        }
    }

    render(ctx) {
        ctx.save();

        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        // Gradient for 3D effect
        const gradient = ctx.createRadialGradient(
            this.position.x - this.radius / 3, this.position.y - this.radius / 3, this.radius / 4,
            this.position.x, this.position.y, this.radius
        );
        gradient.addColorStop(0, this.kinematic ? KINEMATIC_RIGIDBODY_COLOR : RIGIDBODY_COLOR );
        gradient.addColorStop(1, this.kinematic ? KINEMATIC_RIGIDBODY_COLOR_DARK : RIGIDBODY_COLOR_DARK );

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Outline
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#123';
        ctx.stroke();

        ctx.restore();

        if (this.showVisualization) this.renderVisualization(ctx);
    }

    renderVisualization(ctx) {
        super.renderVisualization(ctx);

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = RIGIDBODY_BOUNDINGBOX_COLOR;
        ctx.stroke();
        ctx.restore();
    }
}

class KinematicRectangleBody extends RectangleBody {
    constructor(position, width, height, rotation = 0) {
        super(position, width, height, rotation);
        this.kinematic = true;
        this.mass = 100; 
        this.inertia = 100; 
    }

    update(dt) {}
}

class KinematicCircleBody extends CircleBody {
    constructor(position, radius) {
        super(position, radius);
        this.kinematic = true;
        this.mass = 100; 
        this.inertia = 100; 
    }

    update(dt) {}
}

function handleRectangleRectangleCollision(r1, r2) {
    const corners1 = r1.corners;
    const corners2 = r2.corners;

    const edges1 = getEdges(corners1);
    const edges2 = getEdges(corners2);

    const axes = [];

    edges1.forEach(edge => axes.push(norm({ x: -edge.y, y: edge.x })));
    edges2.forEach(edge => axes.push(norm({ x: -edge.y, y: edge.x })));

    let minOverlap = Infinity;
    let mtvAxis = null;

    for (const axis of axes) {
        const proj1 = projectPoints(corners1, axis);
        const proj2 = projectPoints(corners2, axis);

        if (!overlap(proj1, proj2)) return; // No collision

        const overlapAmount = Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
        if (overlapAmount < minOverlap) {
            minOverlap = overlapAmount;
            mtvAxis = axis;
        }
    }

    const d = sub(r2.position, r1.position);
    if (dot(d, mtvAxis) < 0) mtvAxis = { x: -mtvAxis.x, y: -mtvAxis.y };

    const mtv = { x: mtvAxis.x * minOverlap, y: mtvAxis.y * minOverlap };

    // Positional correction (split between the two bodies)
    if (!r1.kinematic) {
        r1.position.x -= mtv.x / 2;
        r1.position.y -= mtv.y / 2;
    }
    if (!r2.kinematic) {
        r2.position.x += mtv.x / 2;
        r2.position.y += mtv.y / 2;
    }

    // Relative velocity
    const rvx = r2.velocity.x - r1.velocity.x;
    const rvy = r2.velocity.y - r1.velocity.y;
    const relVelAlongNormal = rvx * mtvAxis.x + rvy * mtvAxis.y;

    if (relVelAlongNormal > 0) return; // Moving apart, no impulse

    const restitution = 1; // perfectly elastic
    const impulseScalar = -(1 + restitution) * relVelAlongNormal / (1 / r1.mass + 1 / r2.mass);

    const impulseVector = { x: impulseScalar * mtvAxis.x, y: impulseScalar * mtvAxis.y };

    // Apply linear impulses
    if (!r1.kinematic) {
        r1.linearMomentum.x -= impulseVector.x;
        r1.linearMomentum.y -= impulseVector.y;
    }
    if (!r2.kinematic) {
        r2.linearMomentum.x += impulseVector.x;
        r2.linearMomentum.y += impulseVector.y;
    }

    // --- ROTATIONAL IMPULSE START ---
    // Approximate contact point as midpoint of centers projected along mtvAxis
    const contactPoint = {
        x: (r1.position.x + r2.position.x) / 2,
        y: (r1.position.y + r2.position.y) / 2,
    };

    // Lever arms
    const r1_contact = sub(contactPoint, r1.position);
    const r2_contact = sub(contactPoint, r2.position);

    // Torque impulse = r × impulse
    const r1_torqueImpulse = cross(r1_contact, impulseVector);
    const r2_torqueImpulse = cross(r2_contact, impulseVector);

    // Apply angular momentum changes
    if (!r1.kinematic) r1.angularMomentum -= r1_torqueImpulse;
    if (!r2.kinematic) r2.angularMomentum += r2_torqueImpulse;
    // --- ROTATIONAL IMPULSE END ---
}

function handleCircleCircleCollision(c1, c2) {
    const dx = c2.position.x - c1.position.x;
    const dy = c2.position.y - c1.position.y;
    const dist = Math.hypot(dx, dy);
    const overlap = c1.radius + c2.radius - dist;

    if (overlap <= 0 || dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;

    const rvx = c2.velocity.x - c1.velocity.x;
    const rvy = c2.velocity.y - c1.velocity.y;

    const relVelAlongNormal = rvx * nx + rvy * ny;
    if (relVelAlongNormal > 0) return;

    const impulse = -(2) * relVelAlongNormal / (1 / c1.mass + 1 / c2.mass);

    // Positional correction (split between the two bodies)
    if (!c1.kinematic) {
        c1.position.x -= nx * overlap / 2;
        c1.position.y -= ny * overlap / 2;
    }
    if (!c2.kinematic) {
        c2.position.x += nx * overlap / 2;
        c2.position.y += ny * overlap / 2;
    }

    // Apply linear impulses
    if (!c1.kinematic) {
        c1.linearMomentum.x -= impulse * nx;
        c1.linearMomentum.y -= impulse * ny;
    }
    if (!c2.kinematic) {
        c2.linearMomentum.x += impulse * nx;
        c2.linearMomentum.y += impulse * ny;
    }
}

function handleRectanlgeCircleCollision(rect, circle) {
    // Step 1: circle center in rectangle local space
    const localCirclePos = rect.getLocalPoint(circle.position);

    // Step 2: clamp to rectangle bounds
    const hw = rect.width / 2;
    const hh = rect.height / 2;
    const closestLocalPoint = {
        x: Math.min(hw, Math.max(-hw, localCirclePos.x)),
        y: Math.min(hh, Math.max(-hh, localCirclePos.y))
    };

    // Step 3: closest point in world space
    const closestWorldPoint = rect.getWorldPoint(closestLocalPoint);

    // Step 4: vector from closest point to circle center
    const diff = {
        x: circle.position.x - closestWorldPoint.x,
        y: circle.position.y - closestWorldPoint.y
    };

    const distSq = diff.x * diff.x + diff.y * diff.y;
    const radius = circle.radius;

    // If no collision
    if (distSq > radius * radius) return;

    const dist = Math.sqrt(distSq);

    // Handle rare case: circle center inside rectangle (dist ~ 0)
    const normal = dist === 0 ? { x: 1, y: 0 } : { x: diff.x / dist, y: diff.y / dist };

    const penetration = radius - dist;

    // Positional correction (push apart)
    const totalMass = rect.mass + circle.mass;
    if (!rect.kinematic) {
        rect.position.x -= normal.x * penetration * (circle.mass / totalMass);
        rect.position.y -= normal.y * penetration * (circle.mass / totalMass);
    }
    if (!circle.kinematic) {
        circle.position.x += normal.x * penetration * (rect.mass / totalMass);
        circle.position.y += normal.y * penetration * (rect.mass / totalMass);
    }

    // Relative velocity along normal
    const rvx = circle.velocity.x - rect.velocity.x;
    const rvy = circle.velocity.y - rect.velocity.y;
    const relVelAlongNormal = rvx * normal.x + rvy * normal.y;

    if (relVelAlongNormal > 0) return; // moving apart

    // Calculate impulse scalar
    const restitution = 1; // elastic collision
    const impulseScalar = -(1 + restitution) * relVelAlongNormal / (1 / rect.mass + 1 / circle.mass);

    const impulse = { x: impulseScalar * normal.x, y: impulseScalar * normal.y };

    // Apply linear impulses
    if (!rect.kinematic) {
        rect.linearMomentum.x -= impulse.x;
        rect.linearMomentum.y -= impulse.y;
    }
    if (!circle.kinematic) {
        circle.linearMomentum.x += impulse.x;
        circle.linearMomentum.y += impulse.y;
    }

    // --- ROTATIONAL IMPULSE ---
    // Contact point is closestWorldPoint
    // Lever arms from centers of mass
    const r_rect = sub(closestWorldPoint, rect.position);
    const r_circle = sub(closestWorldPoint, circle.position);

    function cross(a, b) {
        return a.x * b.y - a.y * b.x;
    }

    const torqueRect = cross(r_rect, impulse);
    const torqueCircle = cross(r_circle, impulse);

    if (!rect.kinematic) rect.angularMomentum -= torqueRect / rect.inertia;
    if (!circle.kinematic) circle.angularMomentum += torqueCircle / circle.inertia;
}