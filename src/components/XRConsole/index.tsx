import React from "react";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import { useConsoleSnapshot } from "./useConsoleSnapshot";
import ConsolePanel from "./ConsolePanel";
import IdleActionsXR from "./IdleActionsXR";

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

  if (snapshot.phase === "idle") {
    return <IdleActionsXR onStartDemo={onStartDemo} onStartLive={onStartLive} />;
  }

  return <ConsolePanel snapshot={snapshot} selectedChannel={selectedChannel} />;
};

export default XRConsole;
