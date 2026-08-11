import React from "react";
import { NUM_TRIALS, getAngleForIndex, isMilestone, getMilestoneLabel } from "./angles";
import type { Frame } from "../../utils/signalSource";

interface MilestoneLabelsProps {
  trialIndex: number;
  phase: Frame["phase"];
  onTrialSelect: (index: number) => void;
}

// Clickable trial-number labels at the milestone tick positions (01, 10, 20, 30, 40).
const MilestoneLabels: React.FC<MilestoneLabelsProps> = ({ trialIndex, phase, onTrialSelect }) => (
  <>
    {Array.from({ length: NUM_TRIALS }).map((_, i) => {
      if (!isMilestone(i)) return null;

      const angleDeg = getAngleForIndex(i);
      const rad = ((angleDeg - 90) * Math.PI) / 180;
      const x = 50 + 60 * Math.cos(rad);
      const y = 50 + 60 * Math.sin(rad);
      const isTextActive = i === trialIndex;

      return (
        <button
          key={i}
          onClick={() => onTrialSelect(i)}
          className={`absolute text-[9px] font-mono font-black -translate-x-1/2 -translate-y-1/2 cursor-pointer z-25 transition-all duration-300 w-6 h-6 flex items-center justify-center rounded-full ${isTextActive
            ? phase === "baseline"
              ? "text-indigo-400 scale-110"
              : "text-emerald-400 scale-110"
            : "text-slate-500 hover:text-slate-300"
            }`}
          style={{ left: `${x}%`, top: `${y}%` }}
          title={`Switch to Trial ${i + 1}`}
        >
          {getMilestoneLabel(i)}
        </button>
      );
    })}
  </>
);

export default MilestoneLabels;
