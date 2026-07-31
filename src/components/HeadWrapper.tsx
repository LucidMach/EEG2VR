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

  // WebXR Drag-to-Rotate and Drag-to-Position interaction refs
  const isDraggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartRayOriginRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const dragStartRayDirRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const dragStartHeadsetPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const dragStartQuatRef = useRef<THREE.Quaternion>(new THREE.Quaternion());
  const dragOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const dragDistanceRef = useRef<number>(0);
  const xrPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.3, -1.1));
  const xrRotationRef = useRef<THREE.Quaternion>(new THREE.Quaternion());
  const wasPresentingRef = useRef(false);

  // Pointer event handlers for drag translation and rotation in XR
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!gl.xr.isPresenting) return;
    
    e.stopPropagation();

    // Capture the pointer to continue receiving move/up events even if we drag away from the mesh
    if (e.target && typeof (e.target as any).setPointerCapture === "function") {
      (e.target as any).setPointerCapture(e.pointerId);
    }

    isDraggingRef.current = true;
    pointerIdRef.current = e.pointerId;

    // Save starting controller ray details and headset transform
    dragStartRayOriginRef.current.copy(e.ray.origin);
    dragStartRayDirRef.current.copy(e.ray.direction);
    if (groupRef.current) {
      dragStartHeadsetPosRef.current.copy(groupRef.current.position);
      dragStartQuatRef.current.copy(groupRef.current.quaternion);

      // Compute grab distance and offset vector to prevent snapping
      const grabDistance = e.ray.origin.distanceTo(groupRef.current.position);
      dragDistanceRef.current = grabDistance;

      const initialRayPoint = new THREE.Vector3()
        .copy(e.ray.origin)
        .addScaledVector(e.ray.direction, grabDistance);
      dragOffsetRef.current.subVectors(groupRef.current.position, initialRayPoint);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current || e.pointerId !== pointerIdRef.current) return;

    e.stopPropagation();

    if (groupRef.current) {
      const currentRayOrigin = e.ray.origin;
      const currentRayDir = e.ray.direction;
      const qDiff = new THREE.Quaternion();
      
      // Compute short-arc rotation that aligns initial ray direction to current ray direction
      qDiff.setFromUnitVectors(dragStartRayDirRef.current, currentRayDir);

      // Update position: currentRayOrigin + currentRayDir * dragDistance + rotatedOffset
      const rotatedOffset = dragOffsetRef.current.clone().applyQuaternion(qDiff);
      const newPos = new THREE.Vector3()
        .copy(currentRayOrigin)
        .addScaledVector(currentRayDir, dragDistanceRef.current)
        .add(rotatedOffset);
      
      groupRef.current.position.copy(newPos);
      xrPositionRef.current.copy(newPos);

      // Update rotation
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
        xrPositionRef.current.copy(groupRef.current.position);
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
        // Reset position and rotation on transition to XR
        if (!wasPresentingRef.current) {
          xrPositionRef.current.set(0, 1.3, -1.1);
          xrRotationRef.current.set(0, 0, 0, 1);
          wasPresentingRef.current = true;
        }

        // Apply saved XR position and rotation if not currently dragging
        if (!isDraggingRef.current) {
          groupRef.current.position.copy(xrPositionRef.current);
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
