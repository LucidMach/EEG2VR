import { formatTime } from "../../TrialProgressBar/formatTime";
import { drawTimelineSegment } from "./drawTimelineSegment";
import type { DashboardRenderState, InteractiveHitArea } from "./types";

const NUM_TRIALS = 40;
const TOTAL_DUR = 63;

export function drawTrialTimeline(
  ctx: CanvasRenderingContext2D,
  state: DashboardRenderState,
  box: { x: number; y: number; width: number; height: number },
  hitAreas: InteractiveHitArea[]
): void {
  const { frame } = state;
  const trialIndex = frame.trialIndex ?? 0;
  const elapsed = frame.trialElapsed ?? 0;

  // Background panel for timeline
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.width, box.height, 10);
  ctx.fill();
  ctx.stroke();

  // Timeline track layout
  const trackX = box.x + 20;
  const trackY = box.y + 28;
  const trackW = box.width - 40;

  const activeWeight = 8;
  const inactiveWeight = 1;
  const totalWeight = activeWeight + (NUM_TRIALS - 1) * inactiveWeight;
  const unitW = (trackW - (NUM_TRIALS - 1) * 3) / totalWeight;

  let currentX = trackX;

  for (let i = 0; i < NUM_TRIALS; i++) {
    const isActive = i === trialIndex;
    const segW = (isActive ? activeWeight : inactiveWeight) * unitW;

    drawTimelineSegment({
      ctx,
      state,
      index: i,
      startX: currentX,
      trackY,
      segW,
      hitAreas,
    });

    currentX += segW + 3;
  }

  // Sub-labels: Trial number and Time counter
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`Trial ${trialIndex + 1} of ${NUM_TRIALS}`, box.x + 20, box.y + box.height - 20);

  ctx.textAlign = "right";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`${formatTime(elapsed)} / ${formatTime(TOTAL_DUR)}`, box.x + box.width - 20, box.y + box.height - 20);
}
