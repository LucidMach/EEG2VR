import { ELECTRODE_METADATA, type ElectrodeName } from "../../utils/signalSource";
import type { HistorySample } from "../../hooks/usePlaybackEngine";
import { REGION_RGBA } from "./regionColors";
import { laneCenterY, type LaneLayout } from "./layout";

const HISTORY_LIMIT = 60; // matches the engine's 3s @ 20 Hz ring buffer

interface DrawElectrodeLaneParams {
  ctx: CanvasRenderingContext2D;
  layout: LaneLayout;
  idx: number;
  name: ElectrodeName;
  history: HistorySample[];
  mean: number;
  maxDeviation: number;
  isSelected: boolean;
}

// Draws one electrode's baseline grid line, name label, and rolling
// waveform. The waveform switches to a dashed stroke during baseline
// samples and solid during stimulus samples, breaking the path at each
// phase transition so a single stroke() call can't blend the two styles.
export function drawElectrodeLane({
  ctx,
  layout,
  idx,
  name,
  history,
  mean,
  maxDeviation,
  isSelected,
}: DrawElectrodeLaneParams): void {
  const meta = ELECTRODE_METADATA[name];
  const centerY = laneCenterY(layout, idx);
  const { paddingLeft, drawWidth, width, laneHeight } = layout;

  ctx.beginPath();
  ctx.strokeStyle = isSelected ? "rgba(99, 102, 241, 0.2)" : "rgba(0, 0, 0, 0.05)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.moveTo(paddingLeft, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = isSelected ? "rgba(79, 70, 229, 1.0)" : "rgba(71, 85, 105, 0.65)";
  ctx.font = isSelected ? "bold 10px monospace" : "9px monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(name, paddingLeft - 10, centerY);

  if (history.length <= 1) return;

  ctx.beginPath();
  const color = REGION_RGBA[meta.region] || { r: 100, g: 116, b: 139 };
  const opacity = isSelected ? 0.95 : 0.35;
  ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
  ctx.lineWidth = isSelected ? 2.5 : 1.2;

  const step = drawWidth / (HISTORY_LIMIT - 1);

  history.forEach((sample, i) => {
    const yOffset = ((sample.value - mean) / maxDeviation) * (laneHeight * 0.8 / 2);
    const x = paddingLeft + i * step;
    const y = centerY - yOffset;

    if (i === 0) {
      ctx.moveTo(x, y);
      return;
    }

    const prevSample = history[i - 1];
    if (prevSample.isBaseline !== sample.isBaseline) {
      // Complete the path in the previous segment's style before starting a new one.
      ctx.setLineDash(prevSample.isBaseline ? [2, 3] : []);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  const lastSample = history[history.length - 1];
  ctx.setLineDash(lastSample.isBaseline ? [2, 3] : []);
  ctx.stroke();
  ctx.setLineDash([]);
}
