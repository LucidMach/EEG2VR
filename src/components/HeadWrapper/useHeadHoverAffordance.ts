import { useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";

// Tracks whether the head is currently hovered, and whether the user has
// ever completed a drag this session, so DragAffordance knows when to show
// the hover halo and when to retire the one-time repositioning hint.
export function useHeadHoverAffordance(handlePointerDown: (e: ThreeEvent<PointerEvent>) => void) {
  const hoveredRef = useRef(false);
  const hasDraggedRef = useRef(false);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    hasDraggedRef.current = true;
    handlePointerDown(e);
  };

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hoveredRef.current = true;
  };

  const onPointerOut = () => {
    hoveredRef.current = false;
  };

  return { hoveredRef, hasDraggedRef, onPointerDown, onPointerOver, onPointerOut };
}
