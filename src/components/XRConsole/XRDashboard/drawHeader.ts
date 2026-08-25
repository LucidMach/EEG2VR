import type { DashboardRenderState } from "./types";

export function drawHeader(ctx: CanvasRenderingContext2D, state: DashboardRenderState, width: number): void {
  const { frame, speed, isPaused } = state;
  const isBaseline = frame.phase === "baseline";
  const accentColor = isBaseline ? "#6366f1" : "#10b981";
  const accentGlow = isBaseline ? "rgba(99, 102, 241, 0.4)" : "rgba(16, 185, 129, 0.4)";

  // Top header background bar
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.fillRect(0, 0, width, 56);
  ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 56);
  ctx.lineTo(width, 56);
  ctx.stroke();

  // 1. App Title & Mode Badge
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("EEG DIGITAL TWIN", 24, 28);

  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("DEMO MODE", 185, 28);

  // 2. Center Phase Indicator Pill
  const pillWidth = 160;
  const pillHeight = 30;
  const pillX = width / 2 - pillWidth / 2;
  const pillY = 13;

  ctx.fillStyle = "rgba(2, 6, 23, 0.9)";
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 15);
  ctx.fill();
  ctx.stroke();

  // Glowing phase dot
  ctx.fillStyle = accentColor;
  ctx.shadowColor = accentGlow;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(pillX + 20, pillY + pillHeight / 2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Phase text
  ctx.fillStyle = accentColor;
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  const phaseLabel = isBaseline ? "BASELINE PHASE" : "STIMULUS PHASE";
  ctx.fillText(phaseLabel, pillX + pillWidth / 2 + 8, pillY + pillHeight / 2);

  // 3. Right Status Badges (Valence, Arousal, Speed)
  ctx.textAlign = "right";
  let rightX = width - 24;

  // Speed Badge
  ctx.fillStyle = "rgba(30, 41, 59, 0.8)";
  ctx.strokeStyle = "rgba(71, 85, 105, 0.5)";
  ctx.beginPath();
  ctx.roundRect(rightX - 70, 15, 70, 26, 13);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = isPaused ? "#f59e0b" : "#38bdf8";
  ctx.font = "bold 11px monospace";
  ctx.fillText(`${speed}X ${isPaused ? "PAUSE" : "LIVE"}`, rightX - 10, 28);
  rightX -= 80;

  // Valence / Arousal Chip (Stimulus)
  if (frame.ratings && frame.phase === "stimulus") {
    ctx.fillStyle = "rgba(30, 41, 59, 0.8)";
    ctx.strokeStyle = "rgba(71, 85, 105, 0.5)";
    ctx.beginPath();
    ctx.roundRect(rightX - 160, 15, 150, 26, 13);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`VAL ${frame.ratings.valence.toFixed(1)}  ARO ${frame.ratings.arousal.toFixed(1)}`, rightX - 12, 28);
  }
}
