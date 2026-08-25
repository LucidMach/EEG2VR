import React from "react";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import type { HistorySample } from "../../hooks/usePlaybackEngine";
import { useConsoleSnapshot } from "./useConsoleSnapshot";
import ConsolePanel from "./ConsolePanel";
import IdleActionsXR from "./IdleActionsXR";
import XRDashboard from "./XRDashboard";

interface XRConsoleProps {
  frameRef: React.RefObject<Frame>;
  historiesRef?: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  selectedChannel: ElectrodeName | null;
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
      <IdleActionsXR
        onStartDemo={onStartDemo}
        onStartLive={onStartLive}
        onExitXR={onExitXR}
      />
    );
  }

  if (snapshot.phase === "quality-check") {
    return (
      <ConsolePanel
        snapshot={snapshot}
        selectedChannel={selectedChannel}
        onExitXR={onExitXR}
      />
    );
  }

  return (
    <XRDashboard
      frameRef={frameRef}
      historiesRef={historiesRef}
      selectedChannel={selectedChannel}
      speed={speed}
      isPaused={isPaused}
      onTrialSelect={onTrialSelect}
      onTogglePlayPause={onTogglePlayPause}
      onSetSpeed={onSetSpeed}
      onExitXR={onExitXR}
    />
  );
};

export default XRConsole;
