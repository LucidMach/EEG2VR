import { ELECTRODE_METADATA } from "../../../utils/signalSource";
import { REGION_RGBA } from "../../BackgroundOscilloscopes/regionColors";
import type { DashboardRenderState } from "./types";

export function drawChannelTelemetry(
  ctx: CanvasRenderingContext2D,
  state: DashboardRenderState,
  box: { x: number; y: number; width: number; height: number }
): void {
  const { frame, selectedChannel } = state;
  const meta = selectedChannel ? ELECTRODE_METADATA[selectedChannel] : null;
  const sample = selectedChannel && frame.channels[selectedChannel] ? frame.channels[selectedChannel] : null;
  const val = sample ? sample.value : 0;
  const color = meta ? REGION_RGBA[meta.region] || { r: 148, g: 163, b: 184 } : { r: 148, g: 163, b: 184 };

  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.width, box.height, 10);
  ctx.fill();
  ctx.stroke();

  // Card Header
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("ELECTRODE TELEMETRY", box.x + 16, box.y + 14);

  if (selectedChannel && meta) {
    // Channel Name & Region
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(meta.name, box.x + 16, box.y + 34);

    // Region pill
    const pillX = box.x + 65;
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`;
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
    ctx.beginPath();
    ctx.roundRect(pillX, box.y + 34, 90, 20, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(meta.region.toUpperCase(), pillX + 45, box.y + 40);

    // Full name
    ctx.textAlign = "left";
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(meta.fullName, box.x + 16, box.y + 64);

    // Microvolt Value Readout
    ctx.font = "900 24px monospace";
    ctx.fillStyle = val >= 0 ? "#38bdf8" : "#f43f5e";
    const sign = val >= 0 ? "+" : "";
    ctx.fillText(`${sign}${val.toFixed(2)} µV`, box.x + 16, box.y + 92);

    // Description
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#64748b";
    const desc = meta.description.length > 55 ? `${meta.description.slice(0, 52)}...` : meta.description;
    ctx.fillText(desc, box.x + 16, box.y + 128);
  } else {
    ctx.font = "italic 12px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Point / click an LED on headset to inspect", box.x + 16, box.y + 45);
  }
}
