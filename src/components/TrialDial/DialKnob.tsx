import React from "react";
import type { Frame } from "../../utils/signalSource";
import WatermarkLogo from "./WatermarkLogo";

interface DialKnobProps {
  phase: Frame["phase"];
}

// Circular focus gauge body with phase glow and embedded watermark
const DialKnob: React.FC<DialKnobProps> = ({ phase }) => {
  return (
    <div className="w-30 h-30 rounded-full relative bg-slate-950/95 border-2 border-slate-800/80 shadow-xl flex items-center justify-center pointer-events-none transition-all duration-300">
      <div
        className={`absolute inset-1.5 rounded-full border transition-all duration-300 pointer-events-none ${
          phase === "baseline"
            ? "border-indigo-400/50 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
            : "border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
        }`}
      />
      <WatermarkLogo />
    </div>
  );
};

export default DialKnob;
