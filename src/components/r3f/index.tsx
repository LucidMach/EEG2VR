// Composition root: wires the playback engine to the mode-derived layout and
// renders whichever panels/overlays that layout calls for.
import React, { useState, Suspense, lazy } from "react";
import { usePlaybackEngine } from "../../hooks/usePlaybackEngine";
import type { ElectrodeName } from "../../utils/signalSource";
import { IdleHeadline, IdleActions } from "../IdleSplash";
import BackgroundOscilloscopes from "../BackgroundOscilloscopes";
import { useSpacebarToggle } from "./useSpacebarToggle";
import ChannelTooltip from "./ChannelTooltip";
import AudioErrorToast from "./AudioErrorToast";
import TopHudBar from "./TopHudBar";
import LoadingOverlay from "./LoadingOverlay";
import DemoBottomControls from "./DemoBottomControls";

const Scene = lazy(() => import("../Scene"));

const R3F: React.FC = () => {
  const engine = usePlaybackEngine();
  const [hoveredChannel] = useState<ElectrodeName | null>(null);
  const isIdle = engine.mode.kind === "idle";

  useSpacebarToggle(engine.togglePlayPause);

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative bg-white overflow-hidden text-slate-800 font-sans">
      <BackgroundOscilloscopes
        historiesRef={engine.historiesRef}
        frameRef={engine.frameRef}
        selectedChannel={engine.selectedChannel}
      />

      {/* ======================================================== */}
      {/* 3D VIEWPORT: CENTER SECTION                             */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col relative bg-transparent">
        {!isIdle && hoveredChannel && <ChannelTooltip channel={hoveredChannel} frame={engine.frame} />}
        {engine.audioError && <AudioErrorToast />}
        {!isIdle && <TopHudBar engine={engine} />}

        {/* Layer 1: Solid Text Behind the Headset */}
        {isIdle && <IdleHeadline variant="solid" />}

        {/* 3D R3F Canvas */}
        <div className="w-full h-full z-10">
          <Suspense fallback={null}>
            <Scene
              frameRef={engine.frameRef}
              selectedChannel={engine.selectedChannel}
              onChannelSelect={engine.selectChannel}
              onStartDemo={engine.startDemo}
              onStartLive={engine.startLive}
            />
          </Suspense>
        </div>

        {engine.isLoading && <LoadingOverlay />}

        {/* Layer 3: Outline Text In Front of the Headset */}
        {isIdle && <IdleHeadline variant="outline" />}

        {/* ======================================================== */}
        {/* HOMEPAGE IDLE INTERFACE                                  */}
        {/* ======================================================== */}
        {isIdle && <IdleActions onStartDemo={engine.startDemo} onStartLive={engine.startLive} />}

        {engine.mode.kind === "demo" && (
          <DemoBottomControls frame={engine.frame} onTrialSelect={engine.selectTrial} />
        )}
      </div>
    </div>
  );
};

export default R3F;
