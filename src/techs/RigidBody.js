const RIGIDBODY_BOUNDINGBOX_COLOR = '#00fa43';
const RIGIDBODY_COLOR = 'rgb(248, 221, 47)';
const RIGIDBODY_COLOR_DARK = 'rgba(248, 221, 47, 0.65)';
const KINEMATIC_RIGIDBODY_COLOR = 'rgb(206, 24, 212)'; 
const KINEMATIC_RIGIDBODY_COLOR_DARK = 'rgba(206, 24, 212, 0.67)'; 
const RIGIDBODY_DENSITY = 0.0001; // to calculate mass and intertia, adjusted to need lower momenta

class RigidBody {
    constructor(position, rotation = 0, linearMomentum = {x: 0, y: 0}, angularMomentum = 0) {
        // state variables
        this.position = position; 
        this.rotation = rotation;
        this.linearMomentum = linearMomentum;
        this.angularMomentum = angularMomentum;

        // things to apply
        this.force = { x: 0, y: 0 };
        this.torque = 0;

        this.showVisualization = false;
    }

    toggleVisualization() { this.showVisualization = !this.showVisualization; }

    update(dt) {
        // apply drag
        const drag = 0.4;
        this.addForce({x: -drag * this.linearMomentum.x, y: -drag * this.linearMomentum.y}); 
        this.addTorque(-drag * this.angularMomentum); 

        // velocity verlet intgration 
        this.position.x += this.velocity.x * dt + 0.5 * this.acceleration.x * dt * dt;
        this.position.y += this.velocity.y * dt + 0.5 * this.acceleration.y * dt * dt;
        this.rotation += this.angularVelocity * dt + 0.5 * this.angularAcceleration * dt * dt;

        this.linearMomentum.x += this.force.x * dt; // velocity += acceleration * dt
        this.linearMomentum.y += this.force.y * dt;
        this.angularMomentum += this.torque * dt; // angular velocity += angular acceleration * dt

        this.clearForces();
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

    get acceleration() {
        return {
            x: this.force.x / this.mass,
            y: this.force.y / this.mass
        };
    }

    get angularAcceleration() {
        return this.torque / this.inertia;
    }

    addForce(force) {
        this.force.x += force.x;
        this.force.y += force.y;
    }

    addTorque(torque) {
        this.torque += torque;
    }

    clearForces() {
        this.force.x = 0;
        this.force.y = 0;
        this.torque = 0;
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

    update(dt) {} // dont update 
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
    // collision detection using SAT 
    const corners1 = r1.corners;
    const corners2 = r2.corners;

    const edges = getEdges(corners1).concat(getEdges(corners2));
    const axes = edges.map(edge => norm({ x: -edge.y, y: edge.x })); 

    let minOverlap = Infinity;
    let mtvAxis = null;

    for (const axis of axes) {
        proj1 = projectPoints(corners1, axis);
        proj2 = projectPoints(corners2, axis);
        if (!(proj1.max >= proj2.min && proj2.max >= proj1.min)) return;

        const overlap = Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
        if (overlap < minOverlap) {
            minOverlap = overlap;
            mtvAxis = axis;
        }
    }

    // Ensure MTV axis points from r1 to r2
    const centerDelta = sub(r2.position, r1.position);
    if (dot(centerDelta, mtvAxis) < 0) mtvAxis = scale(mtvAxis, -1);

    const mtv = scale(mtvAxis, minOverlap);

    const contactPoint = scale(add(r1.position, r2.position), 0.5);
    const radius1 = sub(contactPoint, r1.position);
    const radius2 = sub(contactPoint, r2.position);

    const vp1 = add(r1.velocity, scale(radius1, r1.angularVelocity));
    const vp2 = add(r2.velocity, scale(radius2, r2.angularVelocity));
    const rv = sub(vp2, vp1);

    const rvalongNormal = dot(rv, mtvAxis);
    if (rvalongNormal > 0) return;

    const impulse = -(2) * rvalongNormal / (1 / r1.mass + 1 / r2.mass); // from lecture slides, completely elastic
    const impulseVec = scale(mtvAxis, impulse);

    const r1AngularImpulse = cross(radius1, impulseVec);
    const r2AngularImpulse = cross(radius2, impulseVec);

    if (r1.kinematic && !r2.kinematic) {
        r2.position = add(r2.position, mtv); // positional correction 
        r2.linearMomentum = add(r2.linearMomentum, impulseVec); // linear impulse
        r2.angularMomentum += r2AngularImpulse; // angular impulse
    } 
    else if (!r1.kinematic && r2.kinematic) {
        r1.position = sub(r1.position, mtv);
        r1.linearMomentum = sub(r1.linearMomentum, impulseVec);
        r1.angularMomentum -= r1AngularImpulse;
    } 
    else {
        r1.position = sub(r1.position, scale(mtv, 0.5));
        r2.position = add(r2.position, scale(mtv, 0.5));
        r1.linearMomentum = sub(r1.linearMomentum, impulseVec);
        r2.linearMomentum = add(r2.linearMomentum, impulseVec);
        r1.angularMomentum -= r1AngularImpulse;
        r2.angularMomentum += r2AngularImpulse;
    }
}

function handleCircleCircleCollision(c1, c2) { // no rotation to make it simple (not needed for assignment)
    const d = sub(c2.position, c1.position);
    const dist = Math.hypot(d.x, d.y);
    const overlap = c1.radius + c2.radius - dist;

    if (overlap <= 0 || dist === 0) return;

    const n = scale(d, 1 / dist);
    const rv = sub(c2.velocity, c1.velocity);

    const rvAlongNormal = dot(n, rv);
    if (rvAlongNormal > 0) return;

    const impulse = -(2) * rvAlongNormal / (1 / c1.mass + 1 / c2.mass);
    const impulseVec = scale(n, impulse);

    const mtv = scale(n, overlap); 

    if (c1.kinematic && !c2.kinematic) {
        c2.position = add(c2.position, mtv); 
        c2.linearMomentum = add(c2.linearMomentum, impulseVec); 
    } 
    else if (!c1.kinematic && c2.kinematic) {
        c1.position = sub(c1.position, mtv);
        c1.linearMomentum = sub(c1.linearMomentum, impulseVec);
    } 
    else {
        c1.position = sub(c1.position, scale(mtv, 0.5));
        c2.position = add(c2.position, scale(mtv, 0.5));
        c1.linearMomentum = sub(c1.linearMomentum, impulseVec);
        c2.linearMomentum = add(c2.linearMomentum, impulseVec);
    }
}

function handleRectanlgeCircleCollision(rect, circle) {
    const localCircle = rect.getLocalPoint(circle.position);
    const hw = rect.width / 2;
    const hh = rect.height / 2;

    const clamped = {
        x: Math.max(-hw, Math.min(hw, localCircle.x)),
        y: Math.max(-hh, Math.min(hh, localCircle.y))
    };

    const contactPoint = rect.getWorldPoint(clamped);
    const diff = sub(circle.position, contactPoint);
    const distSq = dot(diff, diff);
    const radius = circle.radius;

    if (distSq > radius * radius) return;

    const dist = Math.sqrt(distSq);
    const normal = dist === 0 ? { x: 1, y: 0 } : scale(diff, 1 / dist);
    const penetration = radius - dist;

    const totalMass = rect.mass + circle.mass;
    const rv = sub(circle.velocity, rect.velocity);
    const rvAlongNormal = dot(rv, normal);
    if (rvAlongNormal > 0) return;

    const impulseMag = -(2 * rvAlongNormal) / (1 / rect.mass + 1 / circle.mass);
    const impulse = scale(normal, impulseMag);

    const rRect = sub(contactPoint, rect.position);
    const rCircle = sub(contactPoint, circle.position);

    const torqueRect = cross(rRect, impulse);
    const torqueCircle = cross(rCircle, impulse);

    if (!rect.kinematic) {
        rect.linearMomentum = sub(rect.linearMomentum, impulse);
        rect.angularMomentum -= torqueRect;
        rect.position = sub(rect.position, scale(normal, penetration * (circle.mass / totalMass)));
    }
    if (!circle.kinematic) {
        circle.linearMomentum = add(circle.linearMomentum, impulse);
        circle.angularMomentum += torqueCircle;
        circle.position = add(circle.position, scale(normal, penetration * (rect.mass / totalMass)));
    }
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