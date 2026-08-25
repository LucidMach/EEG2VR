import { ELECTRODE_NAMES, ELECTRODE_METADATA } from "../../../utils/signalSource";
import { REGION_RGBA } from "../../BackgroundOscilloscopes/regionColors";
import { computeScale } from "../../BackgroundOscilloscopes/scale";
import type { CylinderRenderState, CylinderChannelHitArea } from "./types";

export const CYLINDER_CANVAS_WIDTH = 2560;
export const CYLINDER_CANVAS_HEIGHT = 1280;

const HISTORY_LIMIT = 80;

export function renderCylinderWall(
  ctx: CanvasRenderingContext2D,
  state: CylinderRenderState
): CylinderChannelHitArea[] {
  const { frame, histories, selectedChannel, hoveredChannel } = state;
  const hitAreas: CylinderChannelHitArea[] = [];

  const width = CYLINDER_CANVAS_WIDTH;
  const height = CYLINDER_CANVAS_HEIGHT;

  // 1. Deep Space Dark Theme (eliminates VR lens glare)
  ctx.fillStyle = "#070b14";
  ctx.fillRect(0, 0, width, height);

  // Subtle background grid overlay
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 160) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // 2. Top Header Bar
  const headerHeight = 84;
  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.fillRect(0, 0, width, headerHeight);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, headerHeight);
  ctx.lineTo(width, headerHeight);
  ctx.stroke();

  // Header Title & Telemetry
  ctx.font = "900 26px monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("NEURAL TELEMETRY ARENA", 48, headerHeight / 2);

  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("· 21-CHANNEL CONTINUOUS EEG SENSOR OUTPUT", 460, headerHeight / 2);

  // Center Phase Badge
  const isBaseline = frame.phase === "baseline";
  const phaseLabel = isBaseline ? "BASELINE CALIBRATION" : frame.phase === "stimulus" ? "STIMULUS PROTOCOL" : "STANDBY STREAM";
  const phaseColor = isBaseline ? "#818cf8" : frame.phase === "stimulus" ? "#34d399" : "#fbbf24";

  ctx.textAlign = "center";
  ctx.font = "bold 18px monospace";
  ctx.fillStyle = phaseColor;
  ctx.fillText(`●  ${phaseLabel}`, width / 2, headerHeight / 2);

  // Right Telemetry summary
  ctx.textAlign = "right";
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText("SAMPLING: 128 Hz  |  10-20 INTERNATIONAL MONTAGE", width - 48, headerHeight / 2);

  // 3. Render 21 Channels
  const contentY = headerHeight + 16;
  const contentHeight = height - contentY - 24;
  const numChannels = ELECTRODE_NAMES.length;
  const laneHeight = contentHeight / numChannels;

  const { means, maxDeviation } = computeScale(histories);

  const labelWidth = 140;
  const readoutWidth = 160;
  const waveStartX = 48 + labelWidth;
  const waveEndX = width - 48 - readoutWidth;
  const waveWidth = waveEndX - waveStartX;

  ELECTRODE_NAMES.forEach((name, idx) => {
    const laneY = contentY + idx * laneHeight;
    const centerY = laneY + laneHeight / 2;
    const isSelected = name === selectedChannel;
    const isHovered = name === hoveredChannel;
    const meta = ELECTRODE_METADATA[name];
    const regionColor = REGION_RGBA[meta?.region ?? "Frontal"] || { r: 99, g: 102, b: 241 };
    const sample = frame.channels[name];
    const currentVal = sample ? sample.value : 0;

    hitAreas.push({
      name,
      yMin: laneY / height,
      yMax: (laneY + laneHeight) / height,
    });

    // Lane Background Highlight
    if (isSelected) {
      ctx.fillStyle = `rgba(${regionColor.r}, ${regionColor.g}, ${regionColor.b}, 0.18)`;
      ctx.fillRect(32, laneY + 2, width - 64, laneHeight - 4);
      ctx.strokeStyle = `rgba(${regionColor.r}, ${regionColor.g}, ${regionColor.b}, 0.8)`;
      ctx.lineWidth = 2;
      ctx.strokeRect(32, laneY + 2, width - 64, laneHeight - 4);
    } else if (isHovered) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(32, laneY + 2, width - 64, laneHeight - 4);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(32, laneY + 2, width - 64, laneHeight - 4);
    }

    // Lane Center Gridline
    ctx.beginPath();
    ctx.strokeStyle = isSelected
      ? `rgba(${regionColor.r}, ${regionColor.g}, ${regionColor.b}, 0.3)`
      : "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.moveTo(waveStartX, centerY);
    ctx.lineTo(waveEndX, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Channel Badge & Region Pill (Left)
    const badgeW = 60;
    const badgeH = 26;
    const badgeX = 48;
    const badgeY = centerY - badgeH / 2;

    ctx.fillStyle = `rgba(${regionColor.r}, ${regionColor.g}, ${regionColor.b}, ${isSelected ? 0.9 : 0.25})`;
    ctx.strokeStyle = `rgb(${regionColor.r}, ${regionColor.g}, ${regionColor.b})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 16px monospace";
    ctx.fillStyle = isSelected ? "#090d16" : "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, badgeX + badgeW / 2, centerY);

    // Region tag
    ctx.font = "bold 11px monospace";
    ctx.fillStyle = `rgba(${regionColor.r}, ${regionColor.g}, ${regionColor.b}, 0.9)`;
    ctx.textAlign = "left";
    ctx.fillText(meta?.region?.toUpperCase() ?? "", badgeX + badgeW + 10, centerY);

    // Channel Waveform
    const history = histories[name] || [];
    if (history.length > 1) {
      const mean = means[name] ?? 0;
      const step = waveWidth / (HISTORY_LIMIT - 1);

      ctx.beginPath();
      const waveOpacity = isSelected ? 1.0 : 0.75;
      ctx.strokeStyle = `rgba(${regionColor.r}, ${regionColor.g}, ${regionColor.b}, ${waveOpacity})`;
      ctx.lineWidth = isSelected ? 2.8 : 1.6;

      history.forEach((sampleItem, i) => {
        const yOffset = ((sampleItem.value - mean) / (maxDeviation || 1)) * (laneHeight * 0.42);
        const x = waveStartX + i * step;
        const y = centerY - yOffset;

        if (i === 0) {
          ctx.moveTo(x, y);
          return;
        }

        const prevSample = history[i - 1];
        if (prevSample.isBaseline !== sampleItem.isBaseline) {
          ctx.setLineDash(prevSample.isBaseline ? [3, 4] : []);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      const lastSample = history[history.length - 1];
      ctx.setLineDash(lastSample.isBaseline ? [3, 4] : []);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Microvolt Readout (Right)
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = isSelected ? "900 18px monospace" : "bold 15px monospace";
    const sign = currentVal >= 0 ? "+" : "";
    ctx.fillStyle = isSelected
      ? "#38bdf8"
      : currentVal >= 0
      ? "rgba(56, 189, 248, 0.85)"
      : "rgba(244, 63, 94, 0.85)";
    ctx.fillText(`${sign}${currentVal.toFixed(2)} µV`, width - 56, centerY);
  });

  return hitAreas;
}
