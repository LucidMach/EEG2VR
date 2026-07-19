// Electrode inspector panel: metadata for the selected electrode, its
// oscilloscope graph, and (Quality Check only) impedance readout.
import React from "react";
import SignalGraph from "./SignalGraph";
import { getElectrodeMetadata, type ElectrodeName, type Frame } from "../utils/signalSource";

// Color the oscilloscope trace by what the current frame represents.
function graphColorForPhase(phase: Frame["phase"]): string {
  switch (phase) {
    case "baseline": return "#64748b";
    case "stimulus": return "#10b981";
    case "quality-check": return "#ef4444";
    default: return "#10b981";
  }
}

interface RightSidebarProps {
  frame: Frame;
  selectedChannel: ElectrodeName | null;
  valueHistory: number[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ frame, selectedChannel, valueHistory }) => {
  const activeMetadata = selectedChannel ? getElectrodeMetadata(selectedChannel) : null;

  return (
    <div className="w-full md:w-80 bg-white/95 border-t md:border-t-0 md:border-l border-slate-200 z-10 p-5 flex flex-col justify-between overflow-y-auto backdrop-blur-md">
      {/* Active Inspector Panel */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Electrode Inspector
        </h3>

        {activeMetadata ? (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Channel Pill Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                  {activeMetadata.name}
                </span>
                <span className="text-xs text-slate-400 block font-medium mt-0.5">
                  {activeMetadata.fullName}
                </span>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full">
                {activeMetadata.region} Region
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {activeMetadata.description}
            </p>

            {/* Oscilloscope Graph */}
            <div className="h-40 w-full mt-2">
              <SignalGraph
                valueHistory={valueHistory}
                color={graphColorForPhase(frame.phase)}
                label={activeMetadata.name}
                isNormalized={frame.phase === "baseline" || frame.phase === "stimulus"}
              />
            </div>

            {/* Impedance breakdown, Quality Check only */}
            {frame.phase === "quality-check" && selectedChannel && frame.channels[selectedChannel] && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Impedance (kOhm)</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-bold">
                    {(frame.channels[selectedChannel]?.impedance ?? 0).toFixed(2)} kΩ
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      frame.channels[selectedChannel]?.quality === "good"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : frame.channels[selectedChannel]?.quality === "fair"
                        ? "bg-amber-50 text-amber-600 border border-amber-200"
                        : "bg-red-50 text-red-600 border border-red-200"
                    }`}
                  >
                    {frame.channels[selectedChannel]?.quality}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs text-center border-2 border-dashed border-slate-100 rounded-xl p-4">
            Click any sensor node on the headset to display telemetry readout.
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
