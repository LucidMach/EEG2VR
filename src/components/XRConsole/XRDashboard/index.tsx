import React, { useRef } from "react";
import type { ElectrodeName, Frame } from "../../../utils/signalSource";
import type { HistorySample } from "../../../hooks/usePlaybackEngine";
import type { InteractiveHitArea } from "./types";
import { useXRDashboardTexture } from "./useXRDashboardTexture";
import { useXRDashboardInteraction } from "./useXRDashboardInteraction";
import XRDashboardMesh from "./XRDashboardMesh";

export interface XRDashboardProps {
  frameRef: React.RefObject<Frame>;
  historiesRef?: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  selectedChannel: ElectrodeName | null;
  speed?: number;
  isPaused?: boolean;
  onTrialSelect?: (index: number, startOffset?: number) => void;
  onTogglePlayPause?: () => void;
  onSetSpeed?: (speed: number) => void;
  onExitXR?: () => void;
}

export const XRDashboard: React.FC<XRDashboardProps> = ({
  frameRef,
  historiesRef,
  selectedChannel,
  speed = 1,
  isPaused = false,
  onTrialSelect,
  onTogglePlayPause,
  onSetSpeed,
  onExitXR,
}) => {
  const hitAreasRef = useRef<InteractiveHitArea[]>([]);

  const { handlePointerDown, handlePointerMove, handlePointerOut, hoverUvRef } =
    useXRDashboardInteraction({
      hitAreasRef,
      onTrialSelect,
      onTogglePlayPause,
      onSetSpeed,
      onExitXR,
      speed,
    });

  const { texture } = useXRDashboardTexture({
    frameRef,
    historiesRef,
    selectedChannel,
    speed,
    isPaused,
    hoverUvRef,
    hitAreasRef,
  });

  return (
    <XRDashboardMesh
      texture={texture}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    />
  );
};

export default XRDashboard;
