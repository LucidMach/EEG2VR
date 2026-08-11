import React from "react";
import type { Frame } from "../../utils/signalSource";

interface DialReadoutProps {
  phase: Frame["phase"];
  focus?: number;
  focus_avg?: number;
}

// Central digital readout (focus %, running average). Absolutely positioned
// over the knob but rendered as its sibling, so it stays upright while the
// knob rotates underneath it.
const DialReadout: React.FC<DialReadoutProps> = ({ phase, focus, focus_avg }) => {
  const currentFocus = focus !== undefined && focus !== null ? focus : null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-30">
      <span className={`${phase === "baseline"
        ? "text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]"
        : "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
        }`}>
        <span className="text-3xl font-mono font-black tracking-wider transition-all duration-300">
          {currentFocus !== null ? `${(currentFocus * 100).toFixed(0)}` : "--"}
        </span>
        <span className="text-xs font-bold">%</span>
      </span>
      <span className="text-xs font-black tracking-[0.25em] text-slate-500 uppercase mt-0.5">
        FOCUS
      </span>
      <span className="text-[6px] font-mono font-bold tracking-wider text-slate-400 mt-0.5">
        [AVG: {focus_avg !== undefined && focus_avg !== null ? `${Math.round(focus_avg * 100)}%` : "--"}]
      </span>
    </div>
  );
};

export default DialReadout;
