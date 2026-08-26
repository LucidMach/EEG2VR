import { useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { ElectrodeName } from "../../../utils/signalSource";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./renderDashboard";
import type { InteractiveHitArea } from "./types";

interface UseXRDashboardInteractionParams {
  hitAreasRef: React.RefObject<InteractiveHitArea[]>;
  onTrialSelect?: (index: number, startOffset?: number) => void;
  onChannelSelect?: (name: ElectrodeName) => void;
  onTogglePlayPause?: () => void;
  onSetSpeed?: (speed: number) => void;
  onExitXR?: () => void;
  speed?: number;
}

export function useXRDashboardInteraction({
  hitAreasRef,
  onTrialSelect,
  onChannelSelect,
  onTogglePlayPause,
  onSetSpeed,
  onExitXR,
  speed = 1,
}: UseXRDashboardInteractionParams) {
  const hoverUvRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!e.uv) return;
    hoverUvRef.current = { x: e.uv.x, y: e.uv.y };
  };

  const handlePointerOut = () => {
    hoverUvRef.current = null;
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!e.uv) return;
    e.stopPropagation();

    const canvasX = e.uv.x * CANVAS_WIDTH;
    const canvasY = (1 - e.uv.y) * CANVAS_HEIGHT;

    const hitAreas = hitAreasRef.current || [];
    const match = hitAreas.find(
      (area) =>
        canvasX >= area.x &&
        canvasX <= area.x + area.width &&
        canvasY >= area.y &&
        canvasY <= area.y + area.height
    );

    if (!match) return;

    if (match.channelName) {
      onChannelSelect?.(match.channelName);
    } else if (match.trialIndex !== undefined) {
      onTrialSelect?.(match.trialIndex, match.startOffset);
    } else if (match.type === "play-pause") {
      onTogglePlayPause?.();
    } else if (match.type === "speed") {
      onSetSpeed?.(speed === 1 ? 10 : 1);
    } else if (match.type === "exit-xr") {
      onExitXR?.();
    }
  };

  return { handlePointerDown, handlePointerMove, handlePointerOut, hoverUvRef };
}
