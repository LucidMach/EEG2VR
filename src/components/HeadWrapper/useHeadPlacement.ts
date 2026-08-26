import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import {
  getElectrodeFocusQuaternion,
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

const tempVec = new THREE.Vector3();
const tempCamPos = new THREE.Vector3();
const tempWorldUp = new THREE.Vector3(0, 1, 0);

// Per-frame placement of the headset group: a fixed physical-scale pose in
// front of the user in WebXR (draggable via useXRDragInteraction), or an
// auto-scaled showcase/idle layout on the 2D desktop viewport.
// When a channel is selected, smoothly auto-rotates the headset so the electrode
// ring faces the camera orthogonally.
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

    const slerpFactor = 1 - Math.exp(-8 * Math.min(delta, 0.1));

    if (isPresenting) {
      // --- WebXR VR/AR Presentation Layout ---
      // In XR, calculate line of sight from headset to user's VR camera
      state.camera.getWorldPosition(tempCamPos);
      tempVec.subVectors(tempCamPos, xrPositionRef.current).normalize();

      const targetQuat = selectedChannel
        ? getElectrodeFocusQuaternion(selectedChannel, tempVec, tempWorldUp)
        : DEFAULT_HEADSET_QUATERNION;

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

      if (isIdleShowcase && !selectedChannel) {
        // Slow showcase spin plus a subtle bobbing motion when no channel is selected.
        group.rotation.y = time * 0.15;
        group.rotation.x = Math.sin(time * 0.4) * 0.05 + Math.PI / 32;
        group.rotation.z = 0;
        group.position.set(0, -11 * targetScale - Math.cos(time * 1.2) * 0.2, 0);
        group.scale.setScalar(targetScale * 1.1);
      } else {
        group.scale.setScalar(targetScale);
        group.position.set(0, -11 * targetScale, 0);

        // Vector from head position to 2D desktop camera
        state.camera.getWorldPosition(tempCamPos);
        tempVec.subVectors(tempCamPos, group.position).normalize();

        const targetQuat = selectedChannel
          ? getElectrodeFocusQuaternion(selectedChannel, tempVec, state.camera.up)
          : DEFAULT_HEADSET_QUATERNION;

        group.quaternion.slerp(targetQuat, slerpFactor);
      }
    }
  });
}

