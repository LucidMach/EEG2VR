// Floating 3D control board, shown only while presenting in WebXR.
import React from "react";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import { useConsoleSnapshot } from "./useConsoleSnapshot";
import ConsolePanel from "./ConsolePanel";

interface XRConsoleProps {
  frameRef: React.RefObject<Frame>;
  selectedChannel: ElectrodeName | null;
  onStartDemo?: () => void;
  onStartLive?: () => void;
}

const XRConsole: React.FC<XRConsoleProps> = ({
  frameRef,
  selectedChannel,
  onStartDemo,
  onStartLive,
}) => {
  const snapshot = useConsoleSnapshot(frameRef, selectedChannel);

  if (!snapshot.inVR) return null;

  return (
    <ConsolePanel
      snapshot={snapshot}
      selectedChannel={selectedChannel}
      onStartDemo={onStartDemo}
      onStartLive={onStartLive}
    />
  );
};

export default XRConsole;
