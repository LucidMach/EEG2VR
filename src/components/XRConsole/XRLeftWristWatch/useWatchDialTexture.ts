import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Frame } from "../../../utils/signalSource";
import {
  NUM_TRIALS,
  getAngleForIndex,
  isMilestone,
  getMilestoneLabel,
} from "../../TrialDial/angles";

export const WATCH_TEXTURE_SIZE = 1024;

interface UseWatchDialTextureProps {
  frameRef: React.RefObject<Frame>;
}

export function useWatchDialTexture({ frameRef }: UseWatchDialTextureProps) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawTimeRef = useRef<number>(0);
  const lastFrameRef = useRef<Frame | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = WATCH_TEXTURE_SIZE;
    canvas.height = WATCH_TEXTURE_SIZE;
    canvasRef.current = canvas;

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.anisotropy = 8;
    setTexture(tex);

    return () => {
      tex.dispose();
      canvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    let animFrameId = 0;

    const loop = (time: number) => {
      const canvas = canvasRef.current;
      const currentFrame = frameRef.current;

      if (canvas && texture && currentFrame) {
        const elapsed = time - lastDrawTimeRef.current;
        const frameChanged = currentFrame !== lastFrameRef.current;

        if (frameChanged || elapsed >= 33) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            drawWatchFace(ctx, currentFrame, WATCH_TEXTURE_SIZE);
            texture.needsUpdate = true;
            lastDrawTimeRef.current = time;
            lastFrameRef.current = currentFrame;
          }
        }
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [texture, frameRef]);

  return { texture };
}

function drawWatchFace(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  size: number
): void {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.44;

  const trialIndex = frame.trialIndex ?? 0;
  const isBaseline = frame.phase === "baseline";
  const accent = isBaseline ? "#818cf8" : "#34d399";
  const accentGlow = isBaseline
    ? "rgba(129, 140, 248, 0.4)"
    : "rgba(52, 211, 153, 0.4)";
  const currentFocus =
    frame.focus !== undefined && frame.focus !== null ? frame.focus : null;
  const focusAvg = frame.focus_avg;

  // 1. Clear Watch Face to Deep Obsidian
  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 20, 0, Math.PI * 2);
  ctx.fillStyle = "#090d16";
  ctx.fill();

  // Concentric decorative ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.95, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // 2. Outer 40-Trial Milestone & Tick Ring
  for (let i = 0; i < NUM_TRIALS; i++) {
    const angleDeg = getAngleForIndex(i);
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const isMil = isMilestone(i);
    const isPastOrActive = i <= trialIndex;

    const tickLen = isMil ? 28 : 16;
    const rStart = radius - tickLen;
    const rEnd = radius;

    const x1 = cx + rStart * Math.cos(rad);
    const y1 = cy + rStart * Math.sin(rad);
    const x2 = cx + rEnd * Math.cos(rad);
    const y2 = cy + rEnd * Math.sin(rad);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle =
      i === trialIndex
        ? accent
        : isPastOrActive
        ? "rgba(255, 255, 255, 0.7)"
        : "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = i === trialIndex ? 6 : isMil ? 4 : 2;
    ctx.stroke();

    // Milestone labels
    if (isMil) {
      const labelR = radius - 48;
      const lx = cx + labelR * Math.cos(rad);
      const ly = cy + labelR * Math.sin(rad);
      ctx.font = i === trialIndex ? "bold 22px monospace" : "18px monospace";
      ctx.fillStyle = i === trialIndex ? accent : "#94a3b8";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(getMilestoneLabel(i), lx, ly);
    }
  }

  // Active Trial Pointer / Needle Dot
  const activeAngleDeg = getAngleForIndex(trialIndex);
  const activeRad = ((activeAngleDeg - 90) * Math.PI) / 180;
  const needleR = radius * 0.72;
  const nx = cx + needleR * Math.cos(activeRad);
  const ny = cy + needleR * Math.sin(activeRad);

  ctx.beginPath();
  ctx.arc(nx, ny, 10, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.shadowColor = accentGlow;
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;

  // 3. Central Focus Dial Gauge Card
  const innerR = radius * 0.62;
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = "#0e1526";
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Phase Title Badge (Top of Center)
  ctx.font = "900 18px monospace";
  ctx.fillStyle = accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(isBaseline ? "BASELINE" : "STIMULUS", cx, cy - innerR * 0.6);

  // Large Focus Metric Percentage (Center)
  ctx.font = "900 84px monospace";
  ctx.fillStyle = "#ffffff";
  const focusStr =
    currentFocus !== null ? `${Math.round(currentFocus * 100)}%` : "--%";
  ctx.fillText(focusStr, cx, cy - 12);

  // Focus Label
  ctx.font = "bold 22px monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText("FOCUS INDEX", cx, cy + 54);

  // Running Average
  ctx.font = "bold 20px monospace";
  ctx.fillStyle = "#94a3b8";
  const avgStr = focusAvg !== undefined ? `${Math.round(focusAvg * 100)}%` : "--";
  ctx.fillText(`[AVG: ${avgStr}]`, cx, cy + 86);

  // Valence / Arousal Readout (Bottom of Center)
  if (frame.ratings) {
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(
      `VAL ${frame.ratings.valence.toFixed(1)}  ARO ${frame.ratings.arousal.toFixed(1)}`,
      cx,
      cy + innerR * 0.72
    );
  }
}
