import type { ThreeEvent } from "@react-three/fiber";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./renderDashboard";
import type { InteractiveHitArea } from "./types";

interface UseXRDashboardInteractionParams {
  hitAreasRef: React.RefObject<InteractiveHitArea[]>;
  onTrialSelect?: (index: number, startOffset?: number) => void;
  onTogglePlayPause?: () => void;
  onSetSpeed?: (speed: number) => void;
  speed?: number;
}

export function useXRDashboardInteraction({
  hitAreasRef,
  onTrialSelect,
  onTogglePlayPause,
  onSetSpeed,
  speed = 1,
}: UseXRDashboardInteractionParams) {
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!e.uv) return;
    e.stopPropagation();

    // Map UV coordinates (0..1) to Canvas pixel coordinates
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

    if (match.trialIndex !== undefined) {
      onTrialSelect?.(match.trialIndex, match.startOffset);
    } else if (match.type === "play-pause") {
      onTogglePlayPause?.();
    } else if (match.type === "speed") {
      onSetSpeed?.(speed === 1 ? 10 : 1);
    }
  };

  return { handlePointerDown };
}
