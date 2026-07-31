// Dynamically adapts the digital twin's position/scale/rotation for 2D vs.
// WebXR presentation, and hosts the floating XR console alongside it.
//
// Frame data arrives via a ref so this subtree can be memoized upstream and
// stay off the 20 Hz React re-render path — the useFrame loop reads the latest
// frame each three.js frame.
import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import EEGHead from "./eegHead";
import XRConsole from "./XRConsole";
import type { ElectrodeName, Frame } from "../utils/signalSource";

interface HeadWrapperProps {
  frameRef: React.RefObject<Frame>;
  selectedChannel: ElectrodeName | null;
  onChannelSelect: (name: ElectrodeName) => void;
}

const HeadWrapper: React.FC<HeadWrapperProps> = ({ frameRef, selectedChannel, onChannelSelect }) => {
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  // WebXR Drag-to-Rotate interaction refs
  const isDraggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartRayDirRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const dragStartQuatRef = useRef<THREE.Quaternion>(new THREE.Quaternion());
  const xrRotationRef = useRef<THREE.Quaternion>(new THREE.Quaternion());
  const wasPresentingRef = useRef(false);

  // Pointer event handlers for drag rotation in XR
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!gl.xr.isPresenting) return;
    
    e.stopPropagation();

    // Capture the pointer to continue receiving move/up events even if we drag away from the mesh
    if (e.target && typeof (e.target as any).setPointerCapture === "function") {
      (e.target as any).setPointerCapture(e.pointerId);
    }

    isDraggingRef.current = true;
    pointerIdRef.current = e.pointerId;

    // Save starting controller ray direction and current headset quaternion
    dragStartRayDirRef.current.copy(e.ray.direction);
    if (groupRef.current) {
      dragStartQuatRef.current.copy(groupRef.current.quaternion);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current || e.pointerId !== pointerIdRef.current) return;

    e.stopPropagation();

    if (groupRef.current) {
      const currentRayDir = e.ray.direction;
      const qDiff = new THREE.Quaternion();
      
      // Compute short-arc rotation that aligns initial ray direction to current ray direction
      qDiff.setFromUnitVectors(dragStartRayDirRef.current, currentRayDir);

      // Apply the delta rotation to the starting orientation
      const newQuat = new THREE.Quaternion().multiplyQuaternions(qDiff, dragStartQuatRef.current);
      groupRef.current.quaternion.copy(newQuat);
      xrRotationRef.current.copy(newQuat);
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerId === pointerIdRef.current) {
      e.stopPropagation();

      if (e.target && typeof (e.target as any).releasePointerCapture === "function") {
        (e.target as any).releasePointerCapture(e.pointerId);
      }

      isDraggingRef.current = false;
      pointerIdRef.current = null;

      if (groupRef.current) {
        xrRotationRef.current.copy(groupRef.current.quaternion);
      }
    }
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const isPresenting = state.gl.xr.isPresenting;
    const isIdleShowcase = frameRef.current.phase === "idle";

    if (groupRef.current) {
      if (isPresenting) {
        // --- WebXR VR/AR Presentation Layout ---
        // Position at eye level, roughly 1.1 meters in front of the camera
        groupRef.current.position.set(0, 1.3, -1.1);

        // Reset rotation to identity (facing the camera/forward) on transition to XR
        if (!wasPresentingRef.current) {
          xrRotationRef.current.set(0, 0, 0, 1);
          wasPresentingRef.current = true;
        }

        // Apply saved XR rotation if not currently dragging
        if (!isDraggingRef.current) {
          groupRef.current.quaternion.copy(xrRotationRef.current);
        }

        // Scale to a realistic physical head size (approx 22cm diameter)
        groupRef.current.scale.setScalar(0.012);
      } else {
        // --- Standard 2D Desktop Layout ---
        if (wasPresentingRef.current) {
          wasPresentingRef.current = false;
        }

        // Dynamically scale model to occupy exactly 1/3 of the viewport height
        // Model height is approx 22 units in Blender local space.
        const targetScale = state.viewport.height / 66;

        if (isIdleShowcase) {
          // Slow showcase spin in idle mode
          groupRef.current.rotation.y = time * 0.15;
          groupRef.current.rotation.x = Math.sin(time * 0.4) * 0.05 + Math.PI / 32;

          // Subtle bobbing motion
          groupRef.current.position.set(0, -11 * targetScale - Math.cos(time * 1.2) * 0.2, 0);
          groupRef.current.scale.setScalar(targetScale * 1.1);
        } else {
          groupRef.current.scale.setScalar(targetScale);
          groupRef.current.position.set(0, -11 * targetScale, 0);
          groupRef.current.rotation.y = 0;
          groupRef.current.rotation.x = Math.PI / 32;
        }
      }
    }
  });

  return (
    <group>
      <group
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <EEGHead
          ref={groupRef}
          frameRef={frameRef}
          selectedChannel={selectedChannel}
          onChannelSelect={onChannelSelect}
          rotation={[Math.PI / 32, 0, 0]}
        />
      </group>
      {/* Render 3D Floating Console in WebXR Mode only */}
      <XRConsole frameRef={frameRef} selectedChannel={selectedChannel} />
    </group>
  );
};

export default HeadWrapper;
