// System-state panel: connection status, Demo Mode trial readout or Live
// Mode quality-check summary, and the WebXR entry controls.
import React from "react";
import type { AppMode } from "../utils/appMode";
import type { Frame } from "../utils/signalSource";
import { xrStore } from "../utils/xrStore";

interface LeftSidebarProps {
  mode: AppMode;
  frame: Frame;
  showConnectingLoader: boolean;
  showWebXRControls: boolean;
  onDisconnect: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  mode,
  frame,
  showConnectingLoader,
  showWebXRControls,
  onDisconnect,
}) => {
  const device = mode.kind === "live" ? mode.device : undefined;

  return (
    <div className="w-full md:w-80 bg-white/95 border-b md:border-b-0 md:border-r border-slate-200 z-10 p-5 flex flex-col justify-between overflow-y-auto backdrop-blur-md">
      <div>
        {/* Header / App State indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-400">System State</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${mode.kind === "live" ? "bg-emerald-500 animate-ping" : "bg-blue-500"}`}></span>
              <span className="font-bold text-slate-700 text-base capitalize">
                {mode.kind === "live" ? "Live Telemetry" : "Demo Stream"}
              </span>
            </div>
            {device && <span className="text-[10px] text-slate-400 block mt-0.5">{device}</span>}
          </div>
          <button
            onClick={onDisconnect}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 transition-all font-medium"
          >
            Disconnect
          </button>
        </div>

        {/* Connection Check loader for Live Mode */}
        {showConnectingLoader && mode.kind === "live" && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-3"></div>
            <p className="text-sm font-semibold text-slate-700">
              {mode.connection === "searching" ? "Searching for headset..." : "Conducting impedance checks..."}
            </p>
            <p className="text-xs text-slate-400 mt-1">Make sure Bluetooth is enabled</p>
          </div>
        )}

        {/* Demo Mode: DEAP trial playback readout (participant 7) */}
        {mode.kind === "demo" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">DEAP Trial Playback</h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  Trial {(frame.trialIndex ?? 0) + 1}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    frame.phase === "baseline" ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {frame.phase === "baseline" ? "Baseline" : "Stimulus"}
                </span>
              </div>
              {frame.stimulusId && (
                <span className="text-[11px] text-slate-400 font-mono block">{frame.stimulusId}</span>
              )}
              {frame.phase === "stimulus" && frame.ratings && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  {Object.entries(frame.ratings).map(([label, val]) => (
                    <div key={label} className="flex justify-between text-[11px] font-medium text-slate-500 capitalize">
                      <span>{label}</span>
                      <span className="font-mono text-slate-700">{val.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Participant 7's recorded session plays back automatically, trial to trial, including each 3s pre-stimulus baseline.
            </p>
          </div>
        )}

        {/* Live Mode: connection-quality status (no manual mode selection) */}
        {mode.kind === "live" && mode.connection === "connected" && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signal Quality Check</h3>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold block text-red-700">Monitoring Connection Quality</span>
                <span className="text-[10px] text-red-400">Impedance telemetry (kOhm)</span>
              </div>
              <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full font-mono text-red-700">21 Ch</span>
            </div>
          </div>
        )}
      </div>

      {/* WebXR Entry Controls inside Sidebar */}
      {showWebXRControls && (
        <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">WebXR Experience</h3>
          <button
            onClick={() => xrStore.enterVR()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all hover:scale-[1.01]"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-4.5 7.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM9.5 13.5C8.67 13.5 8 12.83 8 12s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
            Enter VR Headset
          </button>
          <button
            onClick={() => xrStore.enterAR()}
            className="w-full flex items-center justify-center gap-2 border border-indigo-600 hover:bg-indigo-50 text-indigo-600 text-sm font-bold py-2.5 px-4 rounded-xl transition-all"
          >
            Launch Mobile AR
          </button>
        </div>
      )}
    </div>
  );
};

export default LeftSidebar;
