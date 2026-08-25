import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
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

  // Update on each animation frame inside R3F / WebXR render loop
  useFrame(() => {
    const canvas = canvasRef.current;
    const currentFrame = frameRef.current;
    const now = performance.now();

    if (canvas && texture && currentFrame) {
      const elapsed = now - lastDrawTimeRef.current;
      const frameChanged = currentFrame !== lastFrameRef.current;

      if (frameChanged || elapsed >= 33) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          drawWebWatchFace(ctx, currentFrame, WATCH_TEXTURE_SIZE);
          texture.needsUpdate = true;
          lastDrawTimeRef.current = now;
          lastFrameRef.current = currentFrame;
        }
      }
    }
  });

  return { texture };
}

function drawWebWatchFace(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  size: number
): void {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.44;

  const trialIndex = frame.trialIndex ?? 0;
  const isBaseline = frame.phase === "baseline";
  const accentColor = isBaseline ? "#818cf8" : "#34d399";
  const accentGlow = isBaseline
    ? "rgba(129, 140, 248, 0.5)"
    : "rgba(52, 211, 153, 0.5)";
  const currentFocus =
    frame.focus !== undefined && frame.focus !== null ? frame.focus : null;
  const focusAvg = frame.focus_avg;

  // 1. Clear Watch Face to Dark Slate (matching web TrialDial knob bg-slate-950/95)
  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 20, 0, Math.PI * 2);
  ctx.fillStyle = "#020617";
  ctx.fill();

  // Outer bezel stroke matching web border-slate-800
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(30, 41, 59, 0.8)";
  ctx.lineWidth = 4;
  ctx.stroke();

  // 2. Outer 40-Trial Milestone & Tick Ring matching web DialTicks
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
        ? accentColor
        : isPastOrActive
        ? "rgba(241, 245, 249, 0.8)"
        : "rgba(100, 116, 139, 0.35)";
    ctx.lineWidth = i === trialIndex ? 6 : isMil ? 4 : 2;
    ctx.stroke();

    // Milestone labels matching web MilestoneLabels (01, 10, 20, 30, 40)
    if (isMil) {
      const labelR = radius - 48;
      const lx = cx + labelR * Math.cos(rad);
      const ly = cy + labelR * Math.sin(rad);
      ctx.font = i === trialIndex ? "bold 24px monospace" : "18px monospace";
      ctx.fillStyle = i === trialIndex ? accentColor : "#64748b";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(getMilestoneLabel(i), lx, ly);
    }
  }

  // 3. Central Rotating Knob Body matching web DialKnob
  const knobR = radius * 0.64;
  ctx.beginPath();
  ctx.arc(cx, cy, knobR, 0, Math.PI * 2);
  ctx.fillStyle = "#090d16";
  ctx.fill();
  ctx.strokeStyle = isBaseline ? "rgba(99, 102, 241, 0.6)" : "rgba(16, 185, 129, 0.6)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Active Trial Pointer Triangle on Knob Edge
  const activeAngleDeg = getAngleForIndex(trialIndex);
  const activeRad = ((activeAngleDeg - 90) * Math.PI) / 180;
  const triangleTipR = knobR - 2;
  const tx = cx + triangleTipR * Math.cos(activeRad);
  const ty = cy + triangleTipR * Math.sin(activeRad);

  ctx.beginPath();
  ctx.arc(tx, ty, 8, 0, Math.PI * 2);
  ctx.fillStyle = accentColor;
  ctx.shadowColor = accentGlow;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  // 4. Embedded Watermark Logo in center
  drawWatermark(ctx, cx, cy, knobR * 0.8);

  // 5. Central Digital Focus Readout matching web DialReadout
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Focus Percentage
  ctx.font = "900 86px monospace";
  ctx.fillStyle = accentColor;
  const focusValStr = currentFocus !== null ? `${Math.round(currentFocus * 100)}` : "--";
  ctx.fillText(focusValStr, cx - 18, cy - 10);

  ctx.font = "bold 34px sans-serif";
  ctx.fillText("%", cx + (focusValStr.length > 2 ? 65 : 48), cy - 18);

  // "FOCUS" Subtitle matching web DialReadout
  ctx.font = "900 20px sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("FOCUS", cx, cy + 44);

  // Running Average matching web DialReadout
  ctx.font = "bold 18px monospace";
  ctx.fillStyle = "#94a3b8";
  const avgStr = focusAvg !== undefined && focusAvg !== null ? `${Math.round(focusAvg * 100)}%` : "--";
  ctx.fillText(`[AVG: ${avgStr}]`, cx, cy + 74);
}

// Draws the subtle 3D cube watermark from web WatermarkLogo
function drawWatermark(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size / 100;
  ctx.scale(s, s);
  ctx.strokeStyle = "rgba(243, 244, 246, 0.08)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, -45);
  ctx.lineTo(39, -22.5);
  ctx.lineTo(19.5, -11.25);
  ctx.lineTo(0, -22.5);
  ctx.lineTo(-19.5, -11.25);
  ctx.lineTo(-39, -22.5);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-39, -22.5);
  ctx.lineTo(-19.5, -11.25);
  ctx.lineTo(-19.5, 11.25);
  ctx.lineTo(0, 22.5);
  ctx.lineTo(0, 45);
  ctx.lineTo(-39, 22.5);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(39, -22.5);
  ctx.lineTo(19.5, -11.25);
  ctx.lineTo(19.5, 11.25);
  ctx.lineTo(0, 22.5);
  ctx.lineTo(0, 45);
  ctx.lineTo(39, 22.5);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}
