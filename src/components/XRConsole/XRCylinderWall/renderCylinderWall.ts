import { ELECTRODE_NAMES, ELECTRODE_METADATA } from "../../../utils/signalSource";
import { REGION_RGBA } from "../../BackgroundOscilloscopes/regionColors";
import { computeScale } from "../../BackgroundOscilloscopes/scale";
import type { CylinderRenderState, CylinderChannelHitArea } from "./types";

export const CYLINDER_CANVAS_HEIGHT = 1024;
export const CYLINDER_ASPECT = (3.6 * 0.9 * Math.PI) / 2.4; // 1:1 physical aspect ratio for cylinder arc
export const CYLINDER_CANVAS_WIDTH = 4344;

const HISTORY_LIMIT = 60; // Matches web background oscilloscope ring buffer

export function renderCylinderWall(
  ctx: CanvasRenderingContext2D,
  state: CylinderRenderState
): CylinderChannelHitArea[] {
  const { frame, histories, selectedChannel, hoveredChannel } = state;
  const hitAreas: CylinderChannelHitArea[] = [];

  const width = CYLINDER_CANVAS_WIDTH;
  const height = CYLINDER_CANVAS_HEIGHT;

  // 1. Clean White Web-Style Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Subtle web grid overlay
  ctx.strokeStyle = "rgba(0, 0, 0, 0.035)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 180) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // 2. Top Header Bar matching web TopHudBar
  const headerHeight = 84;
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, width, headerHeight);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, headerHeight);
  ctx.lineTo(width, headerHeight);
  ctx.stroke();

  // App Title & Branding matching desktop home styling (OffBit + font-black sans-serif)
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // 1. Eyebrow: "AN MNET EXPERIENCE" matching desktop SpannedText (OffBit font)
  ctx.font = "bold 13px 'OffBit', monospace";
  ctx.fillStyle = "#334155";
  ctx.fillText("AN MNET EXPERIENCE", 64, 26);

  // 2. Main Title: "BRAINXR" matching desktop h1 (font-black uppercase sans-serif)
  ctx.font = "900 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("BRAINXR", 64, 56);
  const titleWidth = ctx.measureText("BRAINXR").width;

  // 3. Telemetry subtitle alongside BRAINXR
  ctx.font = "500 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("· 21-Channel Continuous EEG Telemetry", 64 + titleWidth + 18, 56);

  // Center Phase Badge matching web PhaseIndicator
  const isBaseline = frame.phase === "baseline";
  const phasePillW = 340;
  const phasePillH = 42;
  const phasePillX = width / 2 - phasePillW / 2;
  const phasePillY = (headerHeight - phasePillH) / 2;

  ctx.fillStyle = isBaseline ? "rgba(99, 102, 241, 0.1)" : "rgba(16, 185, 129, 0.1)";
  ctx.strokeStyle = isBaseline ? "#6366f1" : "#10b981";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(phasePillX, phasePillY, phasePillW, phasePillH, 21);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isBaseline ? "#4f46e5" : "#059669";
  ctx.font = "bold 16px monospace";
  ctx.textAlign = "center";
  const phaseLabel = isBaseline ? "● BASELINE CALIBRATION" : "● STIMULUS PROTOCOL";
  ctx.fillText(phaseLabel, width / 2, headerHeight / 2);

  // Right sampling readout
  ctx.textAlign = "right";
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText("128 Hz · 10-20 MONTAGE", width - 64, headerHeight / 2);

  // 3. Render 21 Channels matching drawElectrodeLane
  const contentY = headerHeight + 14;
  const contentHeight = height - contentY - 14;
  const numChannels = ELECTRODE_NAMES.length;
  const laneHeight = contentHeight / numChannels;

  const { means, maxDeviation } = computeScale(histories);

  const labelWidth = 140;
  const readoutWidth = 200;
  const waveStartX = 64 + labelWidth;
  const waveEndX = width - 64 - readoutWidth;
  const waveWidth = waveEndX - waveStartX;

  ELECTRODE_NAMES.forEach((name, idx) => {
    const laneY = contentY + idx * laneHeight;
    const centerY = laneY + laneHeight / 2;
    const isSelected = name === selectedChannel;
    const isHovered = name === hoveredChannel;
    const meta = ELECTRODE_METADATA[name];
    const color = REGION_RGBA[meta?.region ?? "Frontal"] || { r: 100, g: 116, b: 139 };
    const sample = frame.channels[name];
    const currentVal = sample ? sample.value : 0;

    hitAreas.push({
      name,
      yMin: laneY / height,
      yMax: (laneY + laneHeight) / height,
    });

    // Lane Selection Highlight (matching web drawElectrodeLane)
    if (isSelected) {
      ctx.fillStyle = "rgba(99, 102, 241, 0.08)";
      ctx.fillRect(48, laneY + 1, width - 96, laneHeight - 2);
    } else if (isHovered) {
      ctx.fillStyle = "rgba(241, 245, 249, 0.6)";
      ctx.fillRect(48, laneY + 1, width - 96, laneHeight - 2);
    }

    // Gridline (matching web drawElectrodeLane)
    ctx.beginPath();
    ctx.strokeStyle = isSelected ? "rgba(99, 102, 241, 0.25)" : "rgba(0, 0, 0, 0.05)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.moveTo(waveStartX, centerY);
    ctx.lineTo(waveEndX, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Channel Name Label on Left (matching web drawElectrodeLane)
    ctx.font = isSelected ? "bold 18px monospace" : "16px monospace";
    ctx.fillStyle = isSelected ? "rgba(79, 70, 229, 1.0)" : "rgba(71, 85, 105, 0.85)";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(name, waveStartX - 24, centerY);

    // Waveform Trace (matching web drawElectrodeLane)
    const history = histories[name] || [];
    if (history.length > 1) {
      const mean = means[name] ?? 0;
      const step = waveWidth / (HISTORY_LIMIT - 1);

      ctx.beginPath();
      const opacity = isSelected ? 0.95 : 0.45;
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
      ctx.lineWidth = isSelected ? 3.0 : 1.6;

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

    // Microvolt Readout on Right
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = isSelected ? "bold 17px monospace" : "15px monospace";
    const sign = currentVal >= 0 ? "+" : "";
    ctx.fillStyle = isSelected ? "#4338ca" : currentVal >= 0 ? "#0284c7" : "#e11d48";
    ctx.fillText(`${sign}${currentVal.toFixed(2)} µV`, width - 64, centerY);
  });

  return hitAreas;
}
