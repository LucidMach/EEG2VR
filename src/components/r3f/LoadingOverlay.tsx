import React from "react";

// Full-viewport spinner shown while the DEAP session asset fetches/parses.
const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 pointer-events-none">
    <div className="w-10 h-10 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
    <span className="text-[10px] md:text-xs font-black tracking-[0.2em] uppercase text-slate-500">
      Loading session…
    </span>
  </div>
);

export default LoadingOverlay;
