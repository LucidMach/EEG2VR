import React, { useEffect, useRef } from "react";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import type { HistorySample } from "../../hooks/usePlaybackEngine";
import { render } from "./render";

interface BackgroundOscilloscopesProps {
  // Rolling per-electrode ring buffers, mutated in place by the playback engine.
  historiesRef: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  // Live frame; its identity changes once per tick and doubles as our "new
  // data arrived, redraw" signal.
  frameRef: React.RefObject<Frame>;
  selectedChannel: ElectrodeName | null;
  hoveredChannel?: ElectrodeName | null;
}

const BackgroundOscilloscopes: React.FC<BackgroundOscilloscopesProps> = ({
  historiesRef,
  frameRef,
  selectedChannel,
  hoveredChannel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Self-driving draw loop: reads the ring buffers off the ref on each animation
  // frame and only repaints when a new tick has arrived (or the selection/hover
  // changed). This keeps the oscilloscope off React's re-render path entirely.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let lastFrame: Frame | null = null;
    let needsRedraw = true; // force a paint on mount / selection / hover change

    const draw = () => {
      const histories = historiesRef.current;

      if (needsRedraw || frameRef.current !== lastFrame) {
        lastFrame = frameRef.current;
        needsRedraw = false;
        render(ctx, canvas, histories, selectedChannel, hoveredChannel);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [historiesRef, frameRef, selectedChannel, hoveredChannel]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default React.memo(BackgroundOscilloscopes);
