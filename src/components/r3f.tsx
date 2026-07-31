// Composition root: wires the playback engine to the mode-derived layout and
// renders whichever panels/overlays that layout calls for.
import React, { useState, useEffect } from "react";
import { usePlaybackEngine } from "../hooks/usePlaybackEngine";
import type { ElectrodeName } from "../utils/signalSource";
import { IdleHeadline, IdleActions } from "./IdleSplash";
import Scene from "./Scene";
import TrialProgressBar from "./TrialProgressBar";
import BackgroundOscilloscopes from "./BackgroundOscilloscopes";
import TrialDial from "./TrialDial";

const R3F: React.FC = () => {
  const engine = usePlaybackEngine();
  const [hoveredChannel] = useState<ElectrodeName | null>(null);
  const isIdle = engine.mode.kind === "idle";

  // Handle Spacebar keydown to toggle Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        engine.togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [engine.togglePlayPause]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative bg-white overflow-hidden text-slate-800 font-sans">
      <BackgroundOscilloscopes historiesRef={engine.historiesRef} frameRef={engine.frameRef} selectedChannel={engine.selectedChannel} />

      {/* ======================================================== */}
      {/* 3D VIEWPORT: CENTER SECTION                             */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col relative bg-transparent">

        {/* Hover / Tooltip HUD overlay */}
        {!isIdle && hoveredChannel && (
          <div className="absolute top-20 left-4 z-20 bg-slate-900/90 text-white rounded-lg p-3 shadow-lg pointer-events-none text-xs flex flex-col gap-1 border border-slate-700">
            <span className="font-bold text-sm text-indigo-400">{hoveredChannel} Electrode</span>
            <span>Value: {(engine.frame.channels[hoveredChannel]?.value ?? 0).toFixed(2)} µV</span>
            {engine.frame.channels[hoveredChannel]?.impedance !== undefined && (
              <span>Impedance: {engine.frame.channels[hoveredChannel]!.impedance!.toFixed(1)} kΩ</span>
            )}
            {engine.frame.channels[hoveredChannel]?.quality && (
              <span className="capitalize">Quality: {engine.frame.channels[hoveredChannel]?.quality}</span>
            )}
          </div>
        )}

        {/* Audio Unavailable Toaster Notification */}
        {engine.audioError && (
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
        )}

        {/* Top HUD Navigation Bar */}
        {!isIdle && (
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-2 pointer-events-none">
            {/* Back/Exit Button */}
            <div className="pointer-events-auto">
              <button
                onClick={engine.disconnect}
                className="flex items-center justify-center p-2 md:p-2.5 rounded-full bg-slate-900/90 border border-slate-700/50 backdrop-blur-md text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-xl hover:border-slate-600"
                title="Exit to main menu"
              >
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
            </div>

            {/* Phase HUD (Centered) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex justify-center">
              {engine.mode.kind === "demo" && (
                <div className="flex items-center gap-1.5 md:gap-2 bg-slate-900/90 border border-slate-700/50 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-2xl transition-all duration-300">
                  <span className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${engine.frame.phase === "baseline"
                    ? "bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                    : "bg-emerald-500 shadow-[0_0_10px_#10b981]"
                    } animate-pulse`} />
                  <span className={`text-[9px] md:text-xs font-black tracking-[0.1em] md:tracking-[0.2em] uppercase transition-all duration-300 ${engine.frame.phase === "baseline" ? "text-indigo-400" : "text-emerald-400"
                    }`}>
                    {engine.frame.phase === "baseline" ? "Baseline" : "Stimulus"}
                    <span className="hidden sm:inline"> Phase</span>
                  </span>
                </div>
              )}
            </div>

            {/* Playback Controls (Right-aligned) */}
            <div className="pointer-events-auto">
              <div className="flex items-center gap-1.5 md:gap-2 bg-slate-900/90 border border-slate-700/50 backdrop-blur-md rounded-full p-1 md:p-1.5 shadow-xl">
                {/* Play / Pause Toggle Button */}
                <button
                  onClick={engine.togglePlayPause}
                  className="flex items-center justify-center p-1.5 md:p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all active:scale-95 cursor-pointer relative group"
                  title={engine.isPaused ? "Play (Spacebar)" : "Pause (Spacebar)"}
                >
                  {engine.isPaused ? (
                    <svg className={`w-4 h-4 md:w-5 md:h-5 fill-current transition-colors duration-300 ${engine.frame.phase === "baseline" ? "text-indigo-400" : "text-emerald-400"}`} viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className={`w-4 h-4 md:w-5 md:h-5 fill-current transition-colors duration-300 ${engine.frame.phase === "baseline" ? "text-indigo-400" : "text-emerald-400"}`} viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  )}
                  {/* Micro-tooltip */}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-950 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap border border-slate-800 font-mono shadow-md text-white z-50">
                    {engine.isPaused ? "Play" : "Pause"} <kbd className="bg-slate-800 px-1 rounded font-sans font-semibold">Space</kbd>
                  </span>
                </button>

                <div className="h-4 md:h-5 w-[1px] bg-slate-800" />

                {/* Speed Toggle (1x / 10x) */}
                <div className="flex items-center bg-slate-950/80 p-0.5 rounded-full border border-slate-800 select-none font-mono text-xs md:text-sm font-bold">
                  <button
                    onClick={() => engine.setSpeed(1)}
                    className={`px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full transition-all cursor-pointer ${engine.speed === 1
                      ? `${engine.frame.phase === "baseline" ? "bg-indigo-600" : "bg-emerald-600"} text-white shadow-sm font-extrabold`
                      : "text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    1x
                  </button>
                  <button
                    onClick={() => engine.setSpeed(10)}
                    className={`px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full transition-all cursor-pointer ${engine.speed === 10
                      ? `${engine.frame.phase === "baseline" ? "bg-indigo-600" : "bg-emerald-600"} text-white shadow-sm font-extrabold`
                      : "text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    10x
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layer 1: Solid Text Behind the Headset */}
        {isIdle && <IdleHeadline variant="solid" />}

        {/* 3D R3F Canvas */}
        <div className="w-full h-full z-10">
          <Scene
            frameRef={engine.frameRef}
            selectedChannel={engine.selectedChannel}
            onChannelSelect={engine.selectChannel}
            mode={engine.mode}
            isPaused={engine.isPaused}
            speed={engine.speed}
            togglePlayPause={engine.togglePlayPause}
            setSpeed={engine.setSpeed}
            startDemo={engine.startDemo}
            startLive={engine.startLive}
            disconnect={engine.disconnect}
            selectTrial={engine.selectTrial}
          />
        </div>

        {/* Loading overlay while the DEAP session asset fetches/parses */}
        {engine.isLoading && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 pointer-events-none">
            <div className="w-10 h-10 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
            <span className="text-[10px] md:text-xs font-black tracking-[0.2em] uppercase text-slate-500">
              Loading session…
            </span>
          </div>
        )}

        {/* Layer 3: Outline Text In Front of the Headset */}
        {isIdle && <IdleHeadline variant="outline" />}

        {/* ======================================================== */}
        {/* HOMEPAGE IDLE INTERFACE                                  */}
        {/* ======================================================== */}
        {isIdle && <IdleActions onStartDemo={engine.startDemo} onStartLive={engine.startLive} />}



        {/* DEMO MODE FLOATING BOTTOM TIMELINE & DIAL */}
        {engine.mode.kind === "demo" && (
          <>
            {/* FLOATING BOTTOM TIMELINE */}
            <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center z-30 pl-8 pr-56 md:px-8 pointer-events-none">
              <div className="w-full max-w-3xl pointer-events-auto">
                <TrialProgressBar
                  trialElapsed={engine.frame.trialElapsed ?? 0}
                  phase={engine.frame.phase}
                  trialIndex={engine.frame.trialIndex ?? 0}
                  onTrialSelect={engine.selectTrial}
                />
              </div>
            </div>

            {/* FLOATING DIAL CONTROL (Bottom Right) */}
            <div className="absolute right-6 bottom-6 z-30 pointer-events-auto">
              <TrialDial
                trialIndex={engine.frame.trialIndex ?? 0}
                totalTrials={40}
                phase={engine.frame.phase}
                trialElapsed={engine.frame.trialElapsed ?? 0}
                focus={engine.frame.focus}
                focus_avg={engine.frame.focus_avg}
                onTrialSelect={engine.selectTrial}
              />
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default R3F;
