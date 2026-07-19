import React, { useEffect, useRef } from "react";
import { ELECTRODE_NAMES, ELECTRODE_METADATA, type ElectrodeName, type SignalPhase } from "../utils/signalSource";
import type { HistorySample } from "../hooks/usePlaybackEngine";

interface BackgroundOscilloscopesProps {
  histories: Record<ElectrodeName, HistorySample[]>;
  selectedChannel: ElectrodeName | null;
  phase: SignalPhase;
}

// Modern, high-trust color palette mapped to head regions
const REGION_RGBA: Record<string, { r: number; g: number; b: number }> = {
  Frontal: { r: 99, g: 102, b: 241 },   // Indigo
  Temporal: { r: 168, g: 85, b: 247 },  // Purple
  Central: { r: 59, g: 130, b: 246 },   // Blue
  Parietal: { r: 6, g: 182, b: 212 },   // Cyan
  Occipital: { r: 16, g: 185, b: 129 }, // Emerald
};

const BackgroundOscilloscopes: React.FC<BackgroundOscilloscopesProps> = ({
  histories,
  selectedChannel,
  phase,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI displays dynamically
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const targetWidth = Math.floor(width * dpr);
    const targetHeight = Math.floor(height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.clearRect(0, 0, width, height);

    const numElectrodes = ELECTRODE_NAMES.length;
    // Add vertical padding to prevent signal lines from overlapping with top/bottom HUD elements
    const paddingTop = 72; // Room for top header controls
    const paddingBottom = 96; // Room for bottom timeline controls
    const usableHeight = Math.max(100, height - paddingTop - paddingBottom);
    const laneHeight = usableHeight / numElectrodes;

    const paddingLeft = 56; // Room for names label at left margin
    const drawWidth = width - paddingLeft - 16; // Add a right margin buffer

    // 1. Calculate means and find global max deviation from the mean across all channels
    // to auto-scale dynamically so both 0-1 range (DEAP data) and larger range (procedural)
    // are displayed at a visible scale.
    const means: Record<string, number> = {};
    let maxDeviation = 1.0; // minimum scale to avoid dividing by 0 / amplifying flat noise

    ELECTRODE_NAMES.forEach((name) => {
      const chanHistory = histories[name] || [];
      if (chanHistory.length > 0) {
        const sum = chanHistory.reduce((a, b) => a + b.value, 0);
        const mean = sum / chanHistory.length;
        means[name] = mean;

        chanHistory.forEach((sample) => {
          const dev = Math.abs(sample.value - mean);
          if (dev > maxDeviation) {
            maxDeviation = dev;
          }
        });
      } else {
        means[name] = 0;
      }
    });

    ELECTRODE_NAMES.forEach((name, idx) => {
      const meta = ELECTRODE_METADATA[name];
      const chanHistory = histories[name] || [];
      const isSelected = name === selectedChannel;

      // Vertical center line of this electrode's lane, shifted by paddingTop
      const centerY = paddingTop + (idx + 0.5) * laneHeight;

      // 1. Draw subtle horizontal grid line representing electrode baseline (0 uV)
      ctx.beginPath();
      ctx.strokeStyle = isSelected ? "rgba(99, 102, 241, 0.2)" : "rgba(0, 0, 0, 0.05)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.moveTo(paddingLeft, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]); // reset line dash style

      // 2. Draw electrode name label
      ctx.fillStyle = isSelected ? "rgba(79, 70, 229, 1.0)" : "rgba(71, 85, 105, 0.65)";
      ctx.font = isSelected ? "bold 10px monospace" : "9px monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(name, paddingLeft - 10, centerY);

      // 3. Draw rolling waveform signal
      if (chanHistory.length > 1) {
        ctx.beginPath();
        const color = REGION_RGBA[meta.region] || { r: 100, g: 116, b: 139 };
        const opacity = isSelected ? 0.95 : 0.35;
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
        ctx.lineWidth = isSelected ? 2.5 : 1.2;

        const numSamples = chanHistory.length;
        // Step size based on 3-second window (60 samples limit)
        const step = drawWidth / (60 - 1);

        for (let i = 0; i < numSamples; i++) {
          const sample = chanHistory[i];
          const val = sample.value;
          const mean = means[name] ?? 0;
          // Zero-center the signal around the mean, then scale to occupy at most 80% of the lane height
          const centeredVal = val - mean;
          const yOffset = (centeredVal / maxDeviation) * (laneHeight * 0.8 / 2);
          const x = paddingLeft + i * step;
          const y = centerY - yOffset;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            const prevSample = chanHistory[i - 1];
            if (prevSample.isBaseline !== sample.isBaseline) {
              // Draw the segment transition by completing current path with its correct style
              if (prevSample.isBaseline) {
                ctx.setLineDash([2, 3]);
              } else {
                ctx.setLineDash([]);
              }
              ctx.lineTo(x, y);
              ctx.stroke();

              // Start a new path for the new style
              ctx.beginPath();
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        }

        // Final stroke for the last segment(s)
        const lastSample = chanHistory[numSamples - 1];
        if (lastSample.isBaseline) {
          ctx.setLineDash([2, 3]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
      }
    });
  }, [histories, selectedChannel, phase]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default BackgroundOscilloscopes;
