export function drawPointerReticle(
  ctx: CanvasRenderingContext2D,
  hoverUv: { x: number; y: number },
  width: number,
  height: number
): void {
  const px = hoverUv.x * width;
  const py = (1 - hoverUv.y) * height;

  ctx.save();

  // 1. High-contrast outer glow
  ctx.shadowColor = "rgba(79, 70, 229, 0.8)";
  ctx.shadowBlur = 10;

  // 2. Outer ring (dark slate with white border)
  ctx.beginPath();
  ctx.arc(px, py, 14, 0, Math.PI * 2);
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(px, py, 14, 0, Math.PI * 2);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Center indicator dot
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#4f46e5";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 4. Crosshair tick marks
  const tickLen = 6;
  const offset = 18;
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2;

  // Top, Bottom, Left, Right
  ctx.beginPath();
  ctx.moveTo(px, py - offset);
  ctx.lineTo(px, py - offset - tickLen);
  ctx.moveTo(px, py + offset);
  ctx.lineTo(px, py + offset + tickLen);
  ctx.moveTo(px - offset, py);
  ctx.lineTo(px - offset - tickLen, py);
  ctx.moveTo(px + offset, py);
  ctx.lineTo(px + offset + tickLen, py);
  ctx.stroke();

  ctx.restore();
}
