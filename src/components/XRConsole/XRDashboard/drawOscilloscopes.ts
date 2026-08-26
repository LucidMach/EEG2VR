import { ELECTRODE_NAMES, ELECTRODE_METADATA } from "../../../utils/signalSource";
import { REGION_RGBA } from "../../BackgroundOscilloscopes/regionColors";
import { computeScale } from "../../BackgroundOscilloscopes/scale";
import type { DashboardRenderState, InteractiveHitArea } from "./types";

const HISTORY_LIMIT = 60;

export function drawOscilloscopes(
  ctx: CanvasRenderingContext2D,
  state: DashboardRenderState,
  box: { x: number; y: number; width: number; height: number },
  hitAreas?: InteractiveHitArea[]
): void {
  const { histories, selectedChannel } = state;
  const { means, maxDeviation } = computeScale(histories);
  const laneHeight = box.height / ELECTRODE_NAMES.length;
  const labelWidth = 48;
  const waveWidth = box.width - labelWidth - 16;
  const waveStartX = box.x + labelWidth;

  // Background panel for graphs
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(box.x, box.y, box.width, box.height);
  ctx.strokeStyle = "rgba(226, 232, 240, 0.9)";
  ctx.lineWidth = 1;
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  ELECTRODE_NAMES.forEach((name, idx) => {
    const centerY = box.y + idx * laneHeight + laneHeight / 2;
    const isSelected = name === selectedChannel;
    const meta = ELECTRODE_METADATA[name];
    const color = REGION_RGBA[meta.region] || { r: 100, g: 116, b: 139 };

    if (hitAreas) {
      hitAreas.push({
        id: `channel-${name}`,
        type: "channel-select",
        x: box.x,
        y: box.y + idx * laneHeight,
        width: box.width,
        height: laneHeight,
        channelName: name,
      });
    }

    if (isSelected) {
      ctx.fillStyle = "rgba(99, 102, 241, 0.08)";
      ctx.fillRect(box.x, box.y + idx * laneHeight, box.width, laneHeight);
    }

    // Gridline
    ctx.beginPath();
    ctx.strokeStyle = isSelected ? "rgba(99, 102, 241, 0.25)" : "rgba(0, 0, 0, 0.05)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.moveTo(waveStartX, centerY);
    ctx.lineTo(waveStartX + waveWidth, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Channel label
    ctx.font = isSelected ? "bold 11px monospace" : "10px monospace";
    ctx.fillStyle = isSelected ? "#4338ca" : `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(name, waveStartX - 8, centerY);

    // Waveform
    const history = histories[name] || [];
    if (history.length <= 1) return;

    const mean = means[name] ?? 0;
    const step = waveWidth / (HISTORY_LIMIT - 1);

    ctx.beginPath();
    const opacity = isSelected ? 1.0 : 0.6;
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
    ctx.lineWidth = isSelected ? 2.2 : 1.2;

    history.forEach((sample, i) => {
      const yOffset = ((sample.value - mean) / maxDeviation) * (laneHeight * 0.42);
      const x = waveStartX + i * step;
      const y = centerY - yOffset;

      if (i === 0) {
        ctx.moveTo(x, y);
        return;
      }

      const prevSample = history[i - 1];
      if (prevSample.isBaseline !== sample.isBaseline) {
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
  });
}
