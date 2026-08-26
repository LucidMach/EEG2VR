import { drawHeader } from "./drawHeader";
import { drawOscilloscopes } from "./drawOscilloscopes";
import { drawFocusDial } from "./drawFocusDial";
import { drawChannelTelemetry } from "./drawChannelTelemetry";
import { drawTrialTimeline } from "./drawTrialTimeline";
import { drawPointerReticle } from "./drawPointerReticle";
import type { DashboardRenderState, InteractiveHitArea } from "./types";

export const CANVAS_WIDTH = 1400;
export const CANVAS_HEIGHT = 900;

export function renderDashboard(
  ctx: CanvasRenderingContext2D,
  state: DashboardRenderState
): InteractiveHitArea[] {
  const hitAreas: InteractiveHitArea[] = [];

  // 1. Clear background
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 2. Draw Top Navigation / Header
  drawHeader(ctx, state, CANVAS_WIDTH, hitAreas);

  // 3. Draw Multi-Channel Oscilloscopes (Left Column)
  drawOscilloscopes(
    ctx,
    state,
    {
      x: 20,
      y: 72,
      width: 880,
      height: 686,
    },
    hitAreas
  );

  // 4. Draw Focus Dial Gauge (Right Column Top)
  drawFocusDial(ctx, state, {
    x: 1145,
    y: 220,
    radius: 125,
  });

  // 5. Draw Selected Electrode Telemetry (Right Column Bottom)
  drawChannelTelemetry(ctx, state, {
    x: 920,
    y: 435,
    width: 460,
    height: 323,
  });

  // 6. Draw 40-Trial Progress Timeline (Bottom Span)
  drawTrialTimeline(
    ctx,
    state,
    {
      x: 20,
      y: 778,
      width: 1360,
      height: 102,
    },
    hitAreas
  );

  // 7. Draw High-Contrast Pointer Reticle if hovering over dashboard
  if (state.hoverUv) {
    drawPointerReticle(ctx, state.hoverUv, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  return hitAreas;
}
