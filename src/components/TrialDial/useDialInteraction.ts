import { useEffect, useRef, useState } from "react";
import type React from "react";
import { NUM_TRIALS, getAngleForIndex } from "./angles";

// Drag/touch/wheel-to-trial-index interaction for the rotary dial knob.
export function useDialInteraction(
  trialIndex: number,
  onTrialSelect: (index: number) => void
) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpdateAngle = (clientX: number, clientY: number) => {
    if (!knobRef.current) return;
    const rect = knobRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;

    // Convert pointer angle to degrees, offset so straight up is 0 degrees.
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg > 180) deg -= 360;
    if (deg < -180) deg += 360;
    const clampedDeg = Math.min(120, Math.max(-120, deg));

    let closestIndex = 0;
    let minDiff = Infinity;
    for (let i = 0; i < NUM_TRIALS; i++) {
      const diff = Math.abs(clampedDeg - getAngleForIndex(i));
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    if (closestIndex !== trialIndex) {
      onTrialSelect(closestIndex);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleUpdateAngle(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    handleUpdateAngle(e.touches[0].clientX, e.touches[0].clientY);
  };

  // While dragging, follow the pointer across the whole window (not just the
  // knob) so a fast drag doesn't lose tracking when it leaves the element.
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleUpdateAngle(e.clientX, e.clientY);
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      handleUpdateAngle(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, trialIndex]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    const nextIndex = Math.min(NUM_TRIALS - 1, Math.max(0, trialIndex + direction));
    if (nextIndex !== trialIndex) {
      onTrialSelect(nextIndex);
    }
  };

  return {
    knobRef,
    isDragging,
    activeAngle: getAngleForIndex(trialIndex),
    handleMouseDown,
    handleTouchStart,
    handleWheel,
  };
}
