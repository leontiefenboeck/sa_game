class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    normalize() {
        let mag = this.magnitude();
        if (mag !== 0) this.scale(1 / mag);
        return this;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }
}

class Particle {
    constructor(position, mass) {
        this.location = position,
        this.speed = new Vector2(0, 0),
        this.F = new Vector2(0, 0),
        this.m = mass,
        this.radius = 25,
        this.attract = true,
        this.trail = [],
        this.isPlayer = false,
        this.ball = null,
        this.G = 1000,
        this.visTrail = false,
        this.visArrows = false,
        this.integration = true
    }




    update(particles, delta) {
        if (particles[0].integration) {
            this.RK4(particles, delta / 1000);
        }
        else {
            this.euler(particles, delta / 1000);
        }
    }

    defineForces(particles, position) {

        let player = particles[0];

        let res = new Vector2(0, 0);
        for (let obstacle of particles) {
            if (obstacle == player) {
                continue;
            }

            ///////////////ADDDDDDDDDD INSTEAD OF SETTING EQUAL FOR MULTIPLE OBSTACLES
            let sub = obstacle.location.clone().subtract(player.location);
            if (position != null) {
                sub = obstacle.location.clone().subtract(position);
            }
            let dist = Math.max(sub.magnitude(), 10);
        
            let force = this.G * player.m * obstacle.m / (dist** 2);
            if (!obstacle.attract) {
                force *= -1;
            }

            res.add(sub.normalize().scale(force));
            /*
            if (position != null) {
                player.F = res;
            }
            */

        }
        return res;
    
    }

    applyForce(particle, force) {
        particle.F.add(force);
    }
    RK4(particles, h){

        let player = particles[0];
        if (!player.ball.isActive) {
            return;
        }

        //current state
        const k1vel = player.speed.clone();
        player.F = this.defineForces(particles, null);
        const k1acc = player.F.clone().scale(1 / player.m);
    
        //state at t + h/2

        let tempPos = player.location.clone().add(k1vel.clone().scale(h / 2));
        let tempVel = player.speed.clone().add(k1acc.clone().scale(h / 2));
        let tempForce = this.defineForces(particles, tempPos);

        const k2vel = tempVel.clone(); 
        const k2acc = tempForce.clone().scale(1 / player.m);


        tempPos = player.location.clone().add(k2vel.clone().scale(h / 2));
        tempVel = player.speed.clone().add(k2acc.clone().scale(h / 2));
        tempForce = this.defineForces(particles, tempPos);

        const k3vel = tempVel.clone();
        const k3acc = tempForce.clone().scale(1 / player.m);

        tempPos = player.location.clone().add(k3vel.clone().scale(h));
        tempVel = player.speed.clone().add(k3acc.clone().scale(h));
        tempForce = this.defineForces(particles, tempPos);

        const k4vel = tempVel.clone();
        const k4acc = tempForce.clone().scale(1 / player.m);

        player.speed.add(
            k1acc.clone().scale(h / 6)
                .add(k2acc.clone().scale(h / 3))
                .add(k3acc.clone().scale(h / 3))
                .add(k4acc.clone().scale(h / 6))
        );

        // Position update
        player.location.add(
            k1vel.clone().scale(h / 6)
                .add(k2vel.clone().scale(h / 3))
                .add(k3vel.clone().scale(h / 3))
                .add(k4vel.clone().scale(h / 6))
        );
        player.ball.x = player.location.x;
        player.ball.y = player.location.y;

        player.ball.vx = player.speed.x;
        player.ball.vy = player.speed.y;

        this.addTrail(player);

    }

    euler(particles, h) {

        let player = particles[0];
        if (!player.ball.isActive) {
            return;
        }

        let forceVector = this.defineForces(particles, null);

        const accelleration = forceVector.clone().scale(1 / player.m);  

        player.speed.add(accelleration.clone().scale(h));
        
        player.location.add(player.speed.clone().scale(h));

        player.ball.x = player.location.x;
        player.ball.y = player.location.y;

        player.ball.vx = player.speed.x;
        player.ball.vy = player.speed.y;

        this.addTrail(player);

    }

    addTrail(player) {
        player.trail.push(player.location.clone());
        if (player.trail.length > 180) {
            player.trail.shift();
        }
    }

    render(particles, ctx)
    {
        if (this.isPlayer) {
            this.visualize(particles, ctx);
            return;
        }
        if (this.attract) {
            ctx.fillStyle = "purple";
        }
        else{
            ctx.fillStyle = "red";
        }


        ctx.beginPath();
        ctx.arc(this.location.x, this.location.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

       
       
    }
    visualize(particles, ctx) {

        let player = this;
        if (this.visTrail && player.trail.length > 2) {

            ctx.beginPath();
            ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
            ctx.lineWidth = 2;

            ctx.moveTo(player.trail[0].x, player.trail[0].y);
            for (let i = 1; i < player.trail.length; i++) {
                ctx.lineTo(player.trail[i].x, player.trail[i].y);
            }

            ctx.stroke();
        }
        let maxLen = 0;
        const forces = [];
        
        if (this.visArrows) {

            for (var x = 25; x < ctx.canvas.width; x+=25) {
                for (var y = 25; y < ctx.canvas.height; y += 25) {
                    const start = new Vector2(x, y);
                    let force = this.defineForces(particles, start.clone(), true);
                    forces.push([start,force]);
                    if (force.magnitude() > maxLen) {
                        maxLen = force.magnitude();
                    }
                
                }
            }
        
            for (let force of forces)
            {
                let len = force[1].magnitude();
                const scaledLen = Math.min(10, Math.max(4, 100 * len  / maxLen ));
                this.drawArrow(ctx, force[0], force[1].normalize().scale(scaledLen));
            }
        
        }
    }

    drawArrow(ctx, start, force) {

        const len = force.magnitude();
        const end = start.clone().add(force.clone().scale(len));


        const angle = Math.atan2(end.y - start.y, end.x - start.x);

        const sideLen = len / 4;
        const sideAngle = Math.PI / 6;


        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y); 
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - sideLen * Math.cos(angle - sideAngle), end.y - sideLen * Math.sin(angle - sideAngle)); 
        ctx.lineTo(end.x - sideLen * Math.cos(angle + sideAngle), end.y - sideLen * Math.sin(angle + sideAngle)); 
        ctx.closePath();
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.stroke();
    }
}