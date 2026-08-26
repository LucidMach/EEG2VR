import type { DashboardRenderState, InteractiveHitArea } from "./types";

const BASELINE_DUR = 3;
const STIMULUS_DUR = 60;

interface DrawSegmentParams {
  ctx: CanvasRenderingContext2D;
  state: DashboardRenderState;
  index: number;
  startX: number;
  trackY: number;
  segW: number;
  hitAreas: InteractiveHitArea[];
}

export function drawTimelineSegment({
  ctx,
  state,
  index,
  startX,
  trackY,
  segW,
  hitAreas,
}: DrawSegmentParams): void {
  const { frame } = state;
  const trialIndex = frame.trialIndex ?? 0;
  const elapsed = frame.trialElapsed ?? 0;
  const isBaseline = frame.phase === "baseline";
  const isActive = index === trialIndex;
  const isPast = index < trialIndex;
  const dotR = isActive ? 7 : 4;

  // 1. Baseline Circle
  const dotX = startX + dotR;
  ctx.beginPath();
  ctx.arc(dotX, trackY, dotR, 0, Math.PI * 2);
  if (isActive) {
    ctx.fillStyle = isBaseline ? "#4f46e5" : "#4338ca";
    ctx.fill();
    ctx.strokeStyle = "#818cf8";
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.fillStyle = isPast ? "#4f46e5" : "#e2e8f0";
    ctx.fill();
    ctx.strokeStyle = isPast ? "#4338ca" : "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  hitAreas.push({
    id: `trial-${index}-base`,
    type: "trial-baseline",
    x: dotX - dotR - 2,
    y: trackY - dotR - 4,
    width: dotR * 2 + 4,
    height: dotR * 2 + 8,
    trialIndex: index,
    startOffset: 0,
  });

  // 2. Stimulus Bar
  const barStartX = dotX + dotR + 3;
  const barW = Math.max(2, segW - (dotR * 2 + 6));
  const barH = isActive ? 8 : 4;
  const barY = trackY - barH / 2;

  ctx.fillStyle = isPast ? "#10b981" : "#e2e8f0";
  ctx.beginPath();
  ctx.roundRect(barStartX, barY, barW, barH, barH / 2);
  ctx.fill();

  if (isActive && !isBaseline) {
    const stimProgress = Math.min(1, Math.max(0, (elapsed - BASELINE_DUR) / STIMULUS_DUR));
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.roundRect(barStartX, barY, barW * stimProgress, barH, barH / 2);
    ctx.fill();
  }

  hitAreas.push({
    id: `trial-${index}-stim`,
    type: "trial-stimulus",
    x: barStartX,
    y: barY - 4,
    width: barW,
    height: barH + 8,
    trialIndex: index,
    startOffset: 3,
  });
}
