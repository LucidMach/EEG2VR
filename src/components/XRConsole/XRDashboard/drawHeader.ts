import type { DashboardRenderState, InteractiveHitArea } from "./types";

export function drawHeader(
  ctx: CanvasRenderingContext2D,
  state: DashboardRenderState,
  width: number,
  hitAreas: InteractiveHitArea[]
): void {
  const { frame, speed, isPaused } = state;
  const isBaseline = frame.phase === "baseline";
  const accentColor = isBaseline ? "#4f46e5" : "#059669";
  const accentGlow = isBaseline ? "rgba(99, 102, 241, 0.25)" : "rgba(16, 185, 129, 0.25)";

  // Top header background bar
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, 56);
  ctx.strokeStyle = "rgba(226, 232, 240, 0.9)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 56);
  ctx.lineTo(width, 56);
  ctx.stroke();

  // 1. App Title & Mode Badge
  ctx.font = "bold 16px monospace";
  ctx.fillStyle = "#0f172a";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("EEG DIGITAL TWIN", 24, 28);
  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText("DEMO MODE", 185, 28);

  // 2. Center Phase Indicator Pill
  const pillWidth = 160;
  const pillHeight = 30;
  const pillX = width / 2 - pillWidth / 2;
  const pillY = 13;

  ctx.fillStyle = isBaseline ? "rgba(99, 102, 241, 0.08)" : "rgba(16, 185, 129, 0.08)";
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 15);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = accentColor;
  ctx.shadowColor = accentGlow;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(pillX + 20, pillY + pillHeight / 2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = accentColor;
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  const phaseLabel = isBaseline ? "BASELINE PHASE" : "STIMULUS PHASE";
  ctx.fillText(phaseLabel, pillX + pillWidth / 2 + 8, pillY + pillHeight / 2);

  // 3. Right Badges & Exit XR Button
  ctx.textAlign = "right";
  let rightX = width - 24;

  // Exit XR Button
  const exitW = 82;
  const exitX = rightX - exitW;
  ctx.fillStyle = "#fee2e2";
  ctx.strokeStyle = "#fca5a5";
  ctx.beginPath();
  ctx.roundRect(exitX, 15, exitW, 26, 13);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#b91c1c";
  ctx.font = "bold 11px monospace";
  ctx.fillText("EXIT XR", rightX - 14, 28);
  hitAreas.push({ id: "exit-xr", type: "exit-xr", x: exitX, y: 15, width: exitW, height: 26 });
  rightX -= exitW + 10;

  // Speed Badge
  ctx.fillStyle = "#f1f5f9";
  ctx.strokeStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.roundRect(rightX - 75, 15, 75, 26, 13);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = isPaused ? "#d97706" : "#0284c7";
  ctx.fillText(`${speed}X ${isPaused ? "PAUSE" : "LIVE"}`, rightX - 10, 28);
  rightX -= 85;

  // Valence / Arousal Chip (Stimulus)
  if (frame.ratings && frame.phase === "stimulus") {
    ctx.fillStyle = "#f1f5f9";
    ctx.strokeStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.roundRect(rightX - 160, 15, 150, 26, 13);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#334155";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`VAL ${frame.ratings.valence.toFixed(1)}  ARO ${frame.ratings.arousal.toFixed(1)}`, rightX - 12, 28);
  }
}
