import React from "react";
import { NUM_TRIALS, getAngleForIndex, isMilestone } from "./angles";
import type { Frame } from "../../utils/signalSource";

interface DialTicksProps {
  trialIndex: number;
  phase: Frame["phase"];
}

// Static ring of gauge ticks around the dial, one per trial.
const DialTicks: React.FC<DialTicksProps> = ({ trialIndex, phase }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
    {Array.from({ length: NUM_TRIALS }).map((_, i) => {
      const angleDeg = getAngleForIndex(i);
      const rad = ((angleDeg - 90) * Math.PI) / 180;
      const isMil = isMilestone(i);
      const tickLength = isMil ? 16 : 10;
      const rStart = 50 - tickLength;
      const rEnd = 50;
      const x1 = 50 + rStart * Math.cos(rad);
      const y1 = 50 + rStart * Math.sin(rad);
      const x2 = 50 + rEnd * Math.cos(rad);
      const y2 = 50 + rEnd * Math.sin(rad);
      const isTickActive = i === trialIndex;

      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className={`transition-all duration-300 ${isTickActive
            ? (phase === "baseline" ? "stroke-indigo-500 stroke-[2px]" : "stroke-emerald-500 stroke-[2px]")
            : (isMil ? "stroke-slate-600 stroke-[1.2px]" : "stroke-slate-800 stroke-[1px]")
            }`}
        />
      );
    })}
  </svg>
);

export default DialTicks;
