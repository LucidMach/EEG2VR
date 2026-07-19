// Composition root: wires the playback engine to the mode-derived layout and
// renders whichever panels/overlays that layout calls for.
import React, { useState } from "react";
import { usePlaybackEngine } from "../hooks/usePlaybackEngine";
import { layoutFor } from "../utils/appMode";
import type { ElectrodeName } from "../utils/signalSource";
import { IdleHeadline, IdleActions } from "./IdleSplash";
import Scene from "./Scene";
import TrialProgressBar from "./TrialProgressBar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

const R3F: React.FC = () => {
  const engine = usePlaybackEngine();
  const [hoveredChannel] = useState<ElectrodeName | null>(null);
  const layout = layoutFor(engine.mode);
  const isIdle = engine.mode.kind === "idle";

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative bg-white overflow-hidden text-slate-800 font-sans">

      {/* ======================================================== */}
      {/* 2D LAYOUT: LEFT SIDEBAR (Controls & Status)              */}
      {/* ======================================================== */}
      {layout.showLeftSidebar && (
        <LeftSidebar
          mode={engine.mode}
          frame={engine.frame}
          showConnectingLoader={layout.showConnectingLoader}
          showWebXRControls={layout.showWebXRControls}
          onDisconnect={engine.disconnect}
        />
      )}

      {/* ======================================================== */}
      {/* 3D VIEWPORT: CENTER SECTION                             */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col relative bg-white">

        {/* Hover / Tooltip HUD overlay */}
        {!isIdle && hoveredChannel && (
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 text-white rounded-lg p-3 shadow-lg pointer-events-none text-xs flex flex-col gap-1 border border-slate-700">
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

        {/* Layer 1: Solid Text Behind the Headset */}
        {isIdle && <IdleHeadline variant="solid" />}

        {/* 3D R3F Canvas */}
        <div className="w-full h-full z-10">
          <Scene
            frame={engine.frame}
            selectedChannel={engine.selectedChannel}
            onChannelSelect={engine.selectChannel}
            isIdle={isIdle}
          />
        </div>

        {/* Layer 3: Outline Text In Front of the Headset */}
        {isIdle && <IdleHeadline variant="outline" />}

        {/* ======================================================== */}
        {/* HOMEPAGE IDLE INTERFACE                                  */}
        {/* ======================================================== */}
        {isIdle && <IdleActions onStartDemo={engine.startDemo} onStartLive={engine.startLive} />}

        {/* DEMO MODE FLOATING BOTTOM TIMELINE */}
        {engine.mode.kind === "demo" && (
          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center z-30 px-8 pointer-events-none">
            <div className="w-full max-w-3xl pointer-events-auto">
              <TrialProgressBar
                trialElapsed={engine.frame.trialElapsed ?? 0}
                phase={engine.frame.phase}
                trialIndex={engine.frame.trialIndex ?? 0}
                playbackSpeed={engine.speed}
                onSpeedChange={engine.setSpeed}
                onTrialSelect={engine.selectTrial}
              />
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2D LAYOUT: RIGHT SIDEBAR (Electrode Inspector & Graph)   */}
      {/* ======================================================== */}
      {layout.showRightSidebar && (
        <RightSidebar
          frame={engine.frame}
          selectedChannel={engine.selectedChannel}
          valueHistory={engine.history}
        />
      )}

    </div>
  );
};

export default R3F;
