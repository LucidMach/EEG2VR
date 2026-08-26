const NUM_TRIALS = 40;
const getAngleForIndex = (i: number) => (i / NUM_TRIALS) * 360;
const isMilestone = (i: number) => (i + 1) % 5 === 0 || i === 0;
const getMilestoneLabel = (i: number) => String(i + 1);
import type { DashboardRenderState } from "./types";

export function drawFocusDial(
  ctx: CanvasRenderingContext2D,
  state: DashboardRenderState,
  center: { x: number; y: number; radius: number }
): void {
  const { frame } = state;
  const { x: cx, y: cy, radius } = center;
  const trialIndex = frame.trialIndex ?? 0;
  const isBaseline = frame.phase === "baseline";
  const accent = isBaseline ? "#4f46e5" : "#059669";
  const currentFocus = frame.focus !== undefined && frame.focus !== null ? frame.focus : null;
  const focusAvg = frame.focus_avg;

  // 1. Outer Tick Ring
  for (let i = 0; i < NUM_TRIALS; i++) {
    const angleDeg = getAngleForIndex(i);
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const isMil = isMilestone(i);
    const tickLen = isMil ? 14 : 8;
    const rStart = radius - tickLen;
    const rEnd = radius;

    const x1 = cx + rStart * Math.cos(rad);
    const y1 = cy + rStart * Math.sin(rad);
    const x2 = cx + rEnd * Math.cos(rad);
    const y2 = cy + rEnd * Math.sin(rad);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = i === trialIndex ? accent : isMil ? "#64748b" : "#cbd5e1";
    ctx.lineWidth = i === trialIndex ? 3 : isMil ? 2 : 1.2;
    ctx.stroke();

    // Milestone labels
    if (isMil) {
      const labelR = radius + 16;
      const lx = cx + labelR * Math.cos(rad);
      const ly = cy + labelR * Math.sin(rad);
      ctx.font = i === trialIndex ? "bold 11px monospace" : "9px monospace";
      ctx.fillStyle = i === trialIndex ? accent : "#64748b";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(getMilestoneLabel(i), lx, ly);
    }
  }

  // 2. Central Knob Body (Clean white card surface)
  const knobR = radius * 0.72;
  ctx.beginPath();
  ctx.arc(cx, cy, knobR, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Pointer Triangle on Knob
  const activeAngleDeg = getAngleForIndex(trialIndex);
  const activeRad = ((activeAngleDeg - 90) * Math.PI) / 180;
  const px = cx + (knobR - 4) * Math.cos(activeRad);
  const py = cy + (knobR - 4) * Math.sin(activeRad);
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();

  // 3. Central Focus Metric Text
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "900 36px monospace";
  ctx.fillStyle = accent;
  ctx.fillText(currentFocus !== null ? `${Math.round(currentFocus * 100)}%` : "--%", cx, cy - 10);

  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "#475569";
  ctx.fillText("FOCUS", cx, cy + 18);

  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#64748b";
  const avgStr = focusAvg !== undefined ? `${Math.round(focusAvg * 100)}%` : "--";
  ctx.fillText(`[AVG: ${avgStr}]`, cx, cy + 34);
}
