import React from "react";
import { XRDomOverlay } from "@react-three/xr";
import { Html } from "@react-three/drei";
import type { PlaybackEngine } from "../../hooks/usePlaybackEngine";
import { IdleActions } from "../IdleSplash";
import TopHudBar from "../r3f/TopHudBar";
import DemoBottomControls from "../r3f/DemoBottomControls";
import { useConsoleSnapshot } from "./useConsoleSnapshot";
import ConsolePanel from "./ConsolePanel";

interface XRConsoleProps {
  engine: PlaybackEngine;
}

const XRConsole: React.FC<XRConsoleProps> = ({ engine }) => {
  const snapshot = useConsoleSnapshot(engine.frameRef, engine.selectedChannel);

  if (!snapshot.inVR) return null;

  const isIdle = engine.mode.kind === "idle";
  const isDemo = engine.mode.kind === "demo";

  const overlayContent = (
    <div className="w-full h-full flex flex-col justify-between relative pointer-events-none select-none">
      {!isIdle && <TopHudBar engine={engine} />}

      {isIdle && (
        <div className="pointer-events-auto">
          <IdleActions onStartDemo={engine.startDemo} onStartLive={engine.startLive} />
        </div>
      )}

      {isDemo && (
        <div className="pointer-events-auto">
          <DemoBottomControls frame={engine.frame} onTrialSelect={engine.selectTrial} />
        </div>
      )}
    </div>
  );

  return (
    <>
      <XRDomOverlay className="w-full h-full pointer-events-none select-none">
        {overlayContent}
      </XRDomOverlay>

      <Html fullscreen zIndexRange={[100, 0]} className="pointer-events-none select-none">
        {overlayContent}
      </Html>

      {!isIdle && <ConsolePanel snapshot={snapshot} selectedChannel={engine.selectedChannel} />}
    </>
  );
};

export default XRConsole;
