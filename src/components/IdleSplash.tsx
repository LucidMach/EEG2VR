// Idle-mode marketing splash: the "an MNET experience / BrainXR" headline
// (rendered twice, solid behind the headset and outlined in front of it) and
// the bottom call-to-action buttons. Only ever shown in idle mode.
import React from "react";

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
      <div className="flex flex-col gap-2">
        <button
          onClick={onStartDemo}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-md active:scale-[0.99]"
        >
          Run Demo Mode
        </button>
        <button
          onClick={onStartLive}
          className="text-slate-600 hover:text-slate-700 text-sm font-semibold mt-1 transition-colors hover:underline"
        >
          Connect your EEG headset
        </button>
      </div>
    </div>
  </div>
);
