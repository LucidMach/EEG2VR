// Floating bottom timeline for Demo Mode: 40 connected trials (baseline
// circle -> stimulus bar), a speed slider, and the elapsed/total readout.
import React from "react";
import type { Frame } from "../utils/signalSource";

interface TrialProgressBarProps {
  trialElapsed: number; // 0 to 63
  phase: Frame["phase"];
  trialIndex: number;
  onTrialSelect: (index: number, startOffset?: number) => void;
}

const TrialProgressBar: React.FC<TrialProgressBarProps> = ({
  trialElapsed,
  phase,
  trialIndex,
  onTrialSelect,
}) => {
  const totalDuration = 63;
  const baselineDuration = 3;

  // Format time display as m:ss
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-2 w-full text-slate-800">
      {/* 40 Connected Trials: Circle (Baseline) -> Bar (Stimulation) */}
      <div className="flex justify-between items-center w-full gap-[2px] select-none">
        {Array.from({ length: 40 }).map((_, i) => {
          const isPast = i < trialIndex;
          const isActive = i === trialIndex;

          // Progress of baseline within active trial (0 to 3s)
          const baselineProgress = isActive && phase === "baseline" ? Math.min(baselineDuration, Math.max(0, trialElapsed)) : 0;
          const baselinePercentage = (baselineProgress / baselineDuration) * 100;

          // Progress of stimulus within active trial
          const stimulusProgress = isActive ? Math.max(0, trialElapsed - baselineDuration) : 0;
          const stimulusPercentage = (stimulusProgress / 60) * 100;

          return (
            <div
              key={i}
              className={`flex items-center min-w-0 transition-all duration-500 ease-in-out ${isActive
                ? "flex-[30] min-w-[150px] md:min-w-[260px] gap-2"
                : "flex-[1] min-w-[10px]"
                }`}
            >
              {/* Baseline Circle (3 seconds) */}
              <button
                onClick={() => onTrialSelect(i, 0)}
                className={`rounded-full shrink-0 transition-[width,height,border-color,box-shadow] duration-300 relative cursor-pointer z-10 ${
                  isActive
                    ? "w-4 h-4 shadow-md " +
                      (phase === "baseline"
                        ? "border-2 border-indigo-600 bg-slate-950/95"
                        : "bg-indigo-600 border border-indigo-500")
                    : isPast
                      ? "w-2.5 h-2.5 bg-indigo-600 border border-indigo-500 shadow-sm"
                      : "w-2.5 h-2.5 bg-slate-950/95 border border-slate-800/80"
                }`}
                style={
                  isActive && phase === "baseline"
                    ? {
                        background: `linear-gradient(to right, #4f46e5 ${baselinePercentage}%, rgba(2, 6, 23, 0.95) ${baselinePercentage}%)`,
                      }
                    : undefined
                }
                title={`Trial ${i + 1} - Baseline (3s)`}
              >
                {isActive && phase === "baseline" && (
                  <span className="absolute inset-[-4px] rounded-full bg-indigo-500/30 animate-pulse" />
                )}
              </button>
 
              {/* Connecting Bar / Stimulation (60 seconds) */}
              <button
                onClick={() => onTrialSelect(i, 3)}
                className={`flex-grow relative cursor-pointer min-w-0 transition-all duration-300 rounded-full ${isActive
                  ? "h-2 bg-slate-950/95 hover:bg-slate-900"
                  : "h-[3px] " + (isPast
                    ? "bg-emerald-500"
                    : "bg-slate-950/50")
                  }`}
                title={`Trial ${i + 1} - Stimulation (60s)`}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-emerald-500 transition-all duration-100 ease-out rounded-full"
                    style={{ width: `${stimulusPercentage}%` }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Sub-label showing current trial details and time readout */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold select-none mt-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-800 font-bold">
            Trial {(trialIndex ?? 0) + 1} of 40
          </span>
        </div>



        <div className="font-mono text-slate-700">
          {formatTime(trialElapsed)} / {formatTime(totalDuration)}
        </div>
      </div>
    </div>
  );
};

export default TrialProgressBar;
