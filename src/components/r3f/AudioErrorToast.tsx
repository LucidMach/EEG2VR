import React from "react";

// Fixed toaster shown when the demo trial's audio asset fails to load.
const AudioErrorToast: React.FC = () => (
  <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2.5 bg-slate-900/90 border border-slate-700/50 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2.5 rounded-full shadow-2xl animate-slide-down pointer-events-auto select-none">
    <div className="flex items-center gap-1.5 md:gap-2">
      <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
      <span className="text-[9px] md:text-xs font-black tracking-[0.1em] md:tracking-[0.2em] uppercase text-red-500 whitespace-nowrap">
        Audio Unavailable
      </span>
    </div>
    <div className="hidden sm:block h-4 w-[1px] bg-slate-800" />
    <span className="hidden sm:inline text-[9px] md:text-xs text-slate-300 font-medium whitespace-nowrap">
      The audio file used to generate DEAP is unavailable
    </span>
  </div>
);

export default AudioErrorToast;
