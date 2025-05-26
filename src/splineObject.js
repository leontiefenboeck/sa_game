class splineObject {
  constructor(size, color, shape, texture) {
    this.size = size || 10;
    this.color = color || 'red';
    this.shape = shape || 'circle'; 
    this.texture = texture || null; 
  }

  render(ctx, position) {
    const size = this.size * canvas.width;

    ctx.save();
    ctx.translate(position.x, position.y);

    if (this.texture) {
      ctx.drawImage(this.texture, -size, -size, size * 2, size * 2);
    } else if (this.shape === 'rect') {
      ctx.fillStyle = this.color;
      ctx.fillRect(-size, -size, size * 2, size * 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    ctx.restore();
  }
}