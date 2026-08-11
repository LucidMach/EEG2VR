import React from "react";
import type { Frame } from "../../utils/signalSource";
import WatermarkLogo from "./WatermarkLogo";

interface DialKnobProps {
  knobRef: React.RefObject<HTMLDivElement | null>;
  phase: Frame["phase"];
  isDragging: boolean;
  activeAngle: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
}

// The rotating knob button itself: phase border, active-trial pointer
// triangle, and the watermark logo. Rotates via inline `transform`, so
// anything that must stay upright (the central readout) is rendered outside
// this component as a sibling instead of a child.
const DialKnob: React.FC<DialKnobProps> = ({
  knobRef,
  phase,
  isDragging,
  activeAngle,
  onMouseDown,
  onTouchStart,
  onWheel,
}) => {
  const activeGlowColor = phase === "baseline"
    ? "shadow-xl border-indigo-500/60"
    : "shadow-xl border-emerald-500/60";

  return (
    <div
      ref={knobRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onWheel={onWheel}
      className={`w-30 h-30 rounded-full relative bg-slate-950/95 border-2 flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-300 ${isDragging ? activeGlowColor : "border-slate-800/80 hover:border-slate-700 shadow-xl"
        }`}
      style={{
        transform: `rotate(${activeAngle}deg)`,
        transition: isDragging
          ? "none"
          : "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s, box-shadow 0.3s, scale 0.3s",
      }}
      title="Drag to rotate, scroll, or click labels to switch trials"
    >
      <div
        className={`absolute inset-1.5 rounded-full border transition-all duration-300 pointer-events-none ${phase === "baseline" ? "border-indigo-400" : "border-emerald-400"
          }`}
      />
      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ${phase === "baseline"
          ? "text-indigo-400 drop-shadow-[0_0_3px_rgba(99,102,241,0.8)]"
          : "text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.8)]"
          }`}
        viewBox="0 0 100 100"
        fill="none"
      >
        <polygon points="50,0 47.5,6 52.5,6" fill="currentColor" />
      </svg>
      <WatermarkLogo />
    </div>
  );
};

export default DialKnob;
