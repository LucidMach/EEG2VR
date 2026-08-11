import React from "react";
import type { Frame } from "../../utils/signalSource";

interface PlaybackControlsProps {
  phase: Frame["phase"];
  isPaused: boolean;
  speed: number;
  onTogglePlayPause: () => void;
  onSetSpeed: (speed: number) => void;
}

// Top-right HUD cluster: play/pause toggle and the 1x/10x speed switch.
const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  phase,
  isPaused,
  speed,
  onTogglePlayPause,
  onSetSpeed,
}) => {
  const phaseColor = phase === "baseline" ? "text-indigo-400" : "text-emerald-400";

  return (
    <div className="pointer-events-auto">
      <div className="flex items-center gap-1.5 md:gap-2 bg-slate-900/90 border border-slate-700/50 backdrop-blur-md rounded-full p-1 md:p-1.5 shadow-xl">
        <button
          onClick={onTogglePlayPause}
          className="flex items-center justify-center p-1.5 md:p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all active:scale-95 cursor-pointer relative group"
          title={isPaused ? "Play (Spacebar)" : "Pause (Spacebar)"}
        >
          {isPaused ? (
            <svg className={`w-4 h-4 md:w-5 md:h-5 fill-current transition-colors duration-300 ${phaseColor}`} viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className={`w-4 h-4 md:w-5 md:h-5 fill-current transition-colors duration-300 ${phaseColor}`} viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-950 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap border border-slate-800 font-mono shadow-md text-white z-50">
            {isPaused ? "Play" : "Pause"} <kbd className="bg-slate-800 px-1 rounded font-sans font-semibold">Space</kbd>
          </span>
        </button>

        <div className="h-4 md:h-5 w-[1px] bg-slate-800" />

        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-full border border-slate-800 select-none font-mono text-xs md:text-sm font-bold">
          <button
            onClick={() => onSetSpeed(1)}
            className={`px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full transition-all cursor-pointer ${speed === 1
              ? `${phase === "baseline" ? "bg-indigo-600" : "bg-emerald-600"} text-white shadow-sm font-extrabold`
              : "text-slate-400 hover:text-slate-200"
              }`}
          >
            1x
          </button>
          <button
            onClick={() => onSetSpeed(10)}
            className={`px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full transition-all cursor-pointer ${speed === 10
              ? `${phase === "baseline" ? "bg-indigo-600" : "bg-emerald-600"} text-white shadow-sm font-extrabold`
              : "text-slate-400 hover:text-slate-200"
              }`}
          >
            10x
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaybackControls;
