import { ELECTRODE_NAMES, type ElectrodeName } from "../../utils/signalSource";
import type { HistorySample } from "../../hooks/usePlaybackEngine";
import { resizeCanvasToDisplaySize, computeLaneLayout } from "./layout";
import { computeScale } from "./scale";
import { drawElectrodeLane } from "./drawElectrodeLane";

// Orchestrates one full repaint: resize, auto-scale, then one lane per electrode.
export function render(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  histories: Record<ElectrodeName, HistorySample[]>,
  selectedChannel: ElectrodeName | null,
  hoveredChannel: ElectrodeName | null = null
): void {
  const { width, height } = resizeCanvasToDisplaySize(canvas, ctx);
  const layout = computeLaneLayout(width, height, ELECTRODE_NAMES.length);
  const { means, maxDeviation } = computeScale(histories);

  ELECTRODE_NAMES.forEach((name, idx) => {
    drawElectrodeLane({
      ctx,
      layout,
      idx,
      name,
      history: histories[name] || [],
      mean: means[name] ?? 0,
      maxDeviation,
      isSelected: name === selectedChannel,
      isHovered: name === hoveredChannel,
    });
  });
}
