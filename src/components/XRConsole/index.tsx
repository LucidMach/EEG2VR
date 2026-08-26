import React from "react";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import type { HistorySample } from "../../hooks/usePlaybackEngine";
import { useConsoleSnapshot } from "./useConsoleSnapshot";
import IdleActionsXR from "./IdleActionsXR";
import XRCylinderWall from "./XRCylinderWall";
import XRControlBar from "./XRControlBar";
import XRAudioErrorAlert from "./XRAudioErrorAlert";

interface XRConsoleProps {
  frameRef: React.RefObject<Frame>;
  historiesRef?: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  selectedChannel: ElectrodeName | null;
  onChannelSelect?: (name: ElectrodeName) => void;
  onChannelHover?: (name: ElectrodeName | null) => void;
  onStartDemo?: () => void;
  onStartLive?: () => void;
  onTrialSelect?: (index: number, startOffset?: number) => void;
  onTogglePlayPause?: () => void;
  onSetSpeed?: (speed: number) => void;
  onExitXR?: () => void;
  speed?: number;
  isPaused?: boolean;
  audioError?: boolean;
}

const XRConsole: React.FC<XRConsoleProps> = ({
  frameRef,
  historiesRef,
  selectedChannel,
  onChannelSelect,
  onChannelHover,
  onStartDemo,
  onStartLive,
  onTrialSelect,
  onTogglePlayPause,
  onSetSpeed,
  onExitXR,
  speed = 1,
  isPaused = false,
  audioError = false,
}) => {
  const snapshot = useConsoleSnapshot(frameRef, selectedChannel);

  if (!snapshot.inVR) return null;

  // Homescreen: Only render idle actions (no signals cylinder)
  if (snapshot.phase === "idle") {
    return (
      <IdleActionsXR
        onStartDemo={onStartDemo}
        onStartLive={onStartLive}
        onExitXR={onExitXR}
      />
    );
  }

  return (
    <group>
      {/* 1. Spatial Floating Audio Error Alert (active if trial audio file is missing) */}
      <XRAudioErrorAlert audioError={audioError} />

      {/* 2. Immersive 21-Channel Oscilloscope Cylinder Wall Surrounding User (Active in Demo/Live Mode) */}
      <XRCylinderWall
        frameRef={frameRef}
        historiesRef={historiesRef}
        selectedChannel={selectedChannel}
        onChannelSelect={onChannelSelect}
        onChannelHover={onChannelHover}
      />

      {/* 3. Spatial Trial Navigation & Playback Controls with Telemetry Below Headset */}
      <XRControlBar
        frameRef={frameRef}
        selectedChannel={selectedChannel}
        speed={speed}
        isPaused={isPaused}
        onTrialSelect={onTrialSelect}
        onTogglePlayPause={onTogglePlayPause}
        onSetSpeed={onSetSpeed}
        onExitXR={onExitXR}
        audioError={audioError}
      />
    </group>
  );
};

export default XRConsole;
