import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import {
  ELECTRODE_FOCUS_QUATERNIONS,
  DEFAULT_HEADSET_QUATERNION,
} from "../eegHead/electrodeNodes";

interface Params {
  groupRef: React.RefObject<THREE.Group | null>;
  frameRef: React.RefObject<Frame>;
  isDraggingRef: React.RefObject<boolean>;
  xrPositionRef: React.RefObject<THREE.Vector3>;
  xrRotationRef: React.RefObject<THREE.Quaternion>;
  selectedChannel?: ElectrodeName | null;
}

// Per-frame placement of the headset group: a fixed physical-scale pose in
// front of the user in WebXR (draggable via useXRDragInteraction), or an
// auto-scaled showcase/idle layout on the 2D desktop viewport.
// When a channel is selected, smoothly auto-rotates the headset to focus on that LED.
export function useHeadPlacement({
  groupRef,
  frameRef,
  isDraggingRef,
  xrPositionRef,
  xrRotationRef,
  selectedChannel,
}: Params): void {
  const wasPresentingRef = useRef(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const isPresenting = state.gl.xr.isPresenting;
    const isIdleShowcase = frameRef.current.phase === "idle";
    const group = groupRef.current;
    if (!group) return;

    const targetQuat =
      (selectedChannel && ELECTRODE_FOCUS_QUATERNIONS[selectedChannel]) ||
      DEFAULT_HEADSET_QUATERNION;
    const slerpFactor = 1 - Math.exp(-8 * Math.min(delta, 0.1));

    if (isPresenting) {
      // --- WebXR VR/AR Presentation Layout ---
      if (!wasPresentingRef.current) {
        xrPositionRef.current.set(0, 1.3, -1.1);
        xrRotationRef.current.copy(targetQuat);
        wasPresentingRef.current = true;
      }

      if (!isDraggingRef.current) {
        xrRotationRef.current.slerp(targetQuat, slerpFactor);
        group.position.copy(xrPositionRef.current);
        group.quaternion.copy(xrRotationRef.current);
      }

      // Scale to a realistic physical head size (approx 22cm diameter)
      group.scale.setScalar(0.012);
    } else {
      // --- Standard 2D Desktop Layout ---
      wasPresentingRef.current = false;

      // Dynamically scale model to occupy exactly 1/3 of the viewport height.
      // Model height is approx 22 units in Blender local space.
      const targetScale = state.viewport.height / 66;

      if (isIdleShowcase) {
        // Slow showcase spin plus a subtle bobbing motion.
        group.rotation.y = time * 0.15;
        group.rotation.x = Math.sin(time * 0.4) * 0.05 + Math.PI / 32;
        group.rotation.z = 0;
        group.position.set(0, -11 * targetScale - Math.cos(time * 1.2) * 0.2, 0);
        group.scale.setScalar(targetScale * 1.1);
      } else {
        group.scale.setScalar(targetScale);
        group.position.set(0, -11 * targetScale, 0);
        group.quaternion.slerp(targetQuat, slerpFactor);
      }
    }
  });
}

