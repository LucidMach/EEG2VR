// Floating bottom timeline for Demo Mode: 40 connected trials (baseline
// circle -> stimulus bar), and the elapsed/total readout.
import React from "react";
import type { Frame } from "../../utils/signalSource";
import TrialSegment from "./TrialSegment";
import { formatTime } from "./formatTime";

interface TrialProgressBarProps {
  trialElapsed: number; // 0 to 63
  phase: Frame["phase"];
  trialIndex: number;
  onTrialSelect: (index: number, startOffset?: number) => void;
}

const TOTAL_DURATION = 63;

const TrialProgressBar: React.FC<TrialProgressBarProps> = ({
  trialElapsed,
  phase,
  trialIndex,
  onTrialSelect,
}) => (
  <div className="flex flex-col gap-2 w-full text-slate-800">
    {/* 40 Connected Trials: Circle (Baseline) -> Bar (Stimulation) */}
    <div className="flex justify-between items-center w-full gap-[2px] select-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <TrialSegment
          key={i}
          index={i}
          isActive={i === trialIndex}
          isPast={i < trialIndex}
          phase={phase}
          trialElapsed={trialElapsed}
          onTrialSelect={onTrialSelect}
        />
      ))}
    </div>

    {/* Sub-label showing current trial details and time readout */}
    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold select-none mt-1">
      <div className="flex items-center gap-2">
        <span className="font-mono text-slate-800 font-bold">
          Trial {(trialIndex ?? 0) + 1} of 40
        </span>
      </div>

      <div className="font-mono text-slate-700">
        {formatTime(trialElapsed)} / {formatTime(TOTAL_DURATION)}
      </div>
    </div>
  </div>
);

export default TrialProgressBar;
