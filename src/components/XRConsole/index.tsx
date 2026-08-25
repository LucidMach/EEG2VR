import React from "react";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import type { HistorySample } from "../../hooks/usePlaybackEngine";
import { useConsoleSnapshot } from "./useConsoleSnapshot";
import IdleActionsXR from "./IdleActionsXR";
import XRCylinderWall from "./XRCylinderWall";
import XRControlBar from "./XRControlBar";
import XRLeftWristWatch from "./XRLeftWristWatch";

interface XRConsoleProps {
  frameRef: React.RefObject<Frame>;
  historiesRef?: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  selectedChannel: ElectrodeName | null;
  onChannelSelect?: (name: ElectrodeName) => void;
  onStartDemo?: () => void;
  onStartLive?: () => void;
  onTrialSelect?: (index: number, startOffset?: number) => void;
  onTogglePlayPause?: () => void;
  onSetSpeed?: (speed: number) => void;
  onExitXR?: () => void;
  speed?: number;
  isPaused?: boolean;
}

const XRConsole: React.FC<XRConsoleProps> = ({
  frameRef,
  historiesRef,
  selectedChannel,
  onChannelSelect,
  onStartDemo,
  onStartLive,
  onTrialSelect,
  onTogglePlayPause,
  onSetSpeed,
  onExitXR,
  speed = 1,
  isPaused = false,
}) => {
  const snapshot = useConsoleSnapshot(frameRef, selectedChannel);

  if (!snapshot.inVR) return null;

  if (snapshot.phase === "idle") {
    return (
      <group>
        <IdleActionsXR
          onStartDemo={onStartDemo}
          onStartLive={onStartLive}
          onExitXR={onExitXR}
        />
        <XRCylinderWall
          frameRef={frameRef}
          historiesRef={historiesRef}
          selectedChannel={selectedChannel}
          onChannelSelect={onChannelSelect}
        />
      </group>
    );
  }

  return (
    <group>
      {/* 1. Immersive 21-Channel Oscilloscope Cylinder Wall Surrounding User */}
      <XRCylinderWall
        frameRef={frameRef}
        historiesRef={historiesRef}
        selectedChannel={selectedChannel}
        onChannelSelect={onChannelSelect}
      />

      {/* 2. Spatial Trial Navigation & Playback Controls Below Headset */}
      <XRControlBar
        frameRef={frameRef}
        selectedChannel={selectedChannel}
        speed={speed}
        isPaused={isPaused}
        onTrialSelect={onTrialSelect}
        onTogglePlayPause={onTogglePlayPause}
        onSetSpeed={onSetSpeed}
        onExitXR={onExitXR}
      />

      {/* 3. Left Hand Focus Metrics Smartwatch Dial */}
      <XRLeftWristWatch frameRef={frameRef} />
    </group>
  );
};

export default XRConsole;
