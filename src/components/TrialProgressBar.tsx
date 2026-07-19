// Floating bottom timeline for Demo Mode: 40 connected trials (baseline
// circle -> stimulus bar), a speed slider, and the elapsed/total readout.
import React from "react";
import type { Frame } from "../utils/signalSource";

interface TrialProgressBarProps {
  trialElapsed: number; // 0 to 63
  phase: Frame["phase"];
  trialIndex: number;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  onTrialSelect: (index: number, startOffset?: number) => void;
}

const TrialProgressBar: React.FC<TrialProgressBarProps> = ({
  trialElapsed,
  phase,
  trialIndex,
  playbackSpeed,
  onSpeedChange,
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

          // Progress of stimulus within active trial
          const stimulusProgress = isActive ? Math.max(0, trialElapsed - baselineDuration) : 0;
          const stimulusPercentage = (stimulusProgress / 60) * 100;

          return (
            <div
              key={i}
              className={`flex items-center min-w-0 transition-all duration-500 ease-in-out ${
                isActive
                  ? "flex-[10] min-w-[70px] md:min-w-[100px] gap-1"
                  : "flex-[1] min-w-[10px]"
              }`}
            >
              {/* Baseline Circle (3 seconds) */}
              <button
                onClick={() => onTrialSelect(i, 0)}
                className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300 relative cursor-pointer z-10 ${
                  isActive && phase === "baseline"
                    ? "border-2 border-indigo-600 bg-white scale-125 shadow-sm"
                    : isPast || (isActive && phase === "stimulus")
                    ? "bg-indigo-600 border border-indigo-500 shadow-sm"
                    : "bg-slate-200 border border-slate-300"
                }`}
                title={`Trial ${i + 1} - Baseline (3s)`}
              >
                {isActive && phase === "baseline" && (
                  <span className="absolute inset-[-4px] rounded-full bg-indigo-500/30 animate-pulse" />
                )}
              </button>

              {/* Connecting Bar / Stimulation (60 seconds) */}
              <button
                onClick={() => onTrialSelect(i, 3)}
                className={`flex-grow h-[3px] relative cursor-pointer min-w-0 transition-all duration-300 rounded-[1px] ${
                  isActive
                    ? "bg-slate-200 hover:bg-slate-300"
                    : isPast
                    ? "bg-emerald-500"
                    : "bg-slate-200/50"
                }`}
                title={`Trial ${i + 1} - Stimulation (60s)`}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-emerald-500 transition-all duration-100 ease-out"
                    style={{ width: `${stimulusPercentage}%` }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Sub-label showing current trial details, speed controller, and time readout */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold select-none mt-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-800 font-bold">
            Trial {(trialIndex ?? 0) + 1} of 40
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide transition-all duration-300 ${
              phase === "baseline"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {phase === "baseline" ? "Baseline Phase" : "Stimulation Phase"}
          </span>
        </div>

        {/* Speed Slider and Timer */}
        <div className="flex items-center gap-4">
          {/* Speed Slider Toggle */}
          <div className="flex items-center gap-2 bg-slate-100/90 px-2 py-1 rounded-lg border border-slate-200/60 select-none">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans">Speed</span>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={playbackSpeed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-16 md:w-24 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 outline-none hover:bg-slate-300 transition-colors"
              title="Adjust Playback Speed"
            />
            <span className="text-[10px] font-extrabold text-slate-700 font-mono w-6 text-right shrink-0">
              {playbackSpeed}x
            </span>
          </div>

          <div className="font-mono text-slate-700">
            {formatTime(trialElapsed)} / {formatTime(totalDuration)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialProgressBar;
