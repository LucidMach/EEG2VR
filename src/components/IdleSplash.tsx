// Idle-mode marketing splash: the "an MNET experience / BrainXR" headline
// (rendered twice, solid behind the headset and outlined in front of it) and
// the bottom call-to-action buttons. Only ever shown in idle mode.
import React from "react";
import { xrStore } from "../utils/xrStore";

interface SpannedTextProps {
  text: string;
  className?: string;
}

const SpannedText: React.FC<SpannedTextProps> = ({ text, className = "" }) => (
  <div className={`flex justify-between w-full font-offbit uppercase tracking-normal select-none ${className}`}>
    {text.split("").map((char, index) => (
      <span key={index}>{char === " " ? " " : char}</span>
    ))}
  </div>
);

interface IdleHeadlineProps {
  variant: "solid" | "outline";
}

export const IdleHeadline: React.FC<IdleHeadlineProps> = ({ variant }) => {
  const textClass = variant === "solid" ? "text-slate-900" : "text-transparent text-stroke-slate";
  const zClass = variant === "solid" ? "z-0" : "z-20";

  return (
    <div className={`absolute top-12 md:top-16 left-0 right-0 ${zClass} pointer-events-none select-none px-6 md:px-12 lg:px-16`}>
      <div className="flex flex-col items-stretch w-full">
        <SpannedText text="an MNET experience" className={`${textClass} text-sm sm:text-base md:text-lg lg:text-xl font-bold`} />
        <h1 className={`flex justify-between w-full text-[13vw] font-black uppercase leading-none ${textClass}`}>
          {"BrainXR".split("").map((char, index) => (
            <span key={index}>{char}</span>
          ))}
        </h1>
      </div>
    </div>
  );
};

interface IdleActionsProps {
  onStartDemo: () => void;
  onStartLive: () => void;
}

export const IdleActions: React.FC<IdleActionsProps> = ({ onStartDemo, onStartLive }) => (
  <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center z-30 px-6">
    <div className="backdrop-blur-md">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onStartDemo}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-full transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            Run Demo Mode
          </button>
          <button
            onClick={() => xrStore.enterVR()}
            className="flex items-center justify-center w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer border border-indigo-400/40 group"
            title="Enter VR"
            aria-label="Enter VR"
          >
            <svg className="w-5 h-5 fill-current transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M21 7H3a2 2 0 00-2 2v6a2 2 0 002 2h4l2 2h6l2-2h4a2 2 0 002-2V9a2 2 0 00-2-2zM7.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
            </svg>
          </button>
        </div>
        <button
          onClick={onStartLive}
          className="text-slate-600 hover:text-slate-700 text-sm font-semibold mt-1 transition-colors hover:underline cursor-pointer"
        >
          Connect your EEG headset
        </button>
      </div>
    </div>
  </div>
);
