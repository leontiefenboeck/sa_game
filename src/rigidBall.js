class RigidBall extends CircleBody {
    
    isActive = false;
    isDragging = false;
    isHovered = false;
    dragStart = null;
    dragCurrent = null;

    update(dt) {
        super.update(dt);
        this.checkStopped();
    }

    containsPoint(x, y) {
        const dx = this.position.x - x;
        const dy = this.position.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }

    checkStopped() {
        const vx = this.linearMomentum.x / this.mass;
        const vy = this.linearMomentum.y / this.mass;
        if (
            this.isActive &&
            Math.abs(vx) < 0.1 &&
            Math.abs(vy) < 0.1
        ) {
            this.isActive = false;
            window.location.reload();
        }
    }

    onMouseDown(e, canvas) {
        if (this.isActive) return false;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (this.containsPoint(x, y)) {
            this.isDragging = true;
            this.dragStart = { x, y };
            this.dragCurrent = { x, y };
            return true;
        }
        return false;
    }

    onMouseMove(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (this.isDragging) {
            this.dragCurrent = { x, y };
        }
        this.isHovered = this.containsPoint(x, y) && !this.isActive && !this.isDragging;
    }

    onMouseUp(e, canvas) {
        if (!this.isDragging) return false;
        const rect = canvas.getBoundingClientRect();
        const dragEnd = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        const vx = (this.dragStart.x - dragEnd.x) * 5;
        const vy = (this.dragStart.y - dragEnd.y) * 5;
        this.linearMomentum.x = vx * this.mass;
        this.linearMomentum.y = vy * this.mass;

        this.isDragging = false;
        this.isActive = true;
        this.dragCurrent = null;

        return true;
    }

    render(ctx) {
        if (this.isDragging && this.dragStart && this.dragCurrent) {
            const cx = this.position.x;
            const cy = this.position.y;
            const dx = this.dragCurrent.x - cx;
            const dy = this.dragCurrent.y - cy;
            const dragLen = Math.sqrt(dx * dx + dy * dy);

            const maxDragLen = 120; // pixels
            const cappedDragLen = Math.min(dragLen, maxDragLen);

            if (cappedDragLen > 10) {
                const dirX = dx / (dragLen || 1);
                const dirY = dy / (dragLen || 1);

                const tipX = cx + dirX * this.radius;
                const tipY = cy + dirY * this.radius;

                const baseX = cx + dirX * (this.radius + cappedDragLen);
                const baseY = cy + dirY * (this.radius + cappedDragLen);

                const minWidth = 10;
                const maxWidth = 28;
                const width = minWidth + (maxWidth - minWidth) * (cappedDragLen / maxDragLen);

                const perpX = -dirY;
                const perpY = dirX;

                const leftBaseX = baseX + perpX * (width * 0.5);
                const leftBaseY = baseY + perpY * (width * 0.5);
                const rightBaseX = baseX - perpX * (width * 0.5);
                const rightBaseY = baseY - perpY * (width * 0.5);

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(leftBaseX, leftBaseY);
                ctx.lineTo(tipX, tipY);
                ctx.lineTo(rightBaseX, rightBaseY);
                ctx.closePath();

                const grad = ctx.createLinearGradient(baseX, baseY, tipX, tipY);
                grad.addColorStop(0, "#1976d2");
                grad.addColorStop(1, "#00e676");
                ctx.fillStyle = grad;
                ctx.shadowColor = "#1976d2";
                ctx.shadowBlur = 12;
                ctx.globalAlpha = 0.85;
                ctx.fill();

                // white outline
                ctx.globalAlpha = 1;
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#fff";
                ctx.stroke();
                ctx.restore();
            }
        }

        // Ball Shadow 
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        // Ball Gradient
        const gradient = ctx.createRadialGradient(
            this.position.x - this.radius * 0.4, this.position.y - this.radius * 0.4, this.radius * 0.2,
            this.position.x, this.position.y, this.radius
        );
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, '#ff6666');
        gradient.addColorStop(1, '#b20000');

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#123';
        ctx.stroke();

        if (this.showVisualization) this.renderVisualization(ctx);
    }
}