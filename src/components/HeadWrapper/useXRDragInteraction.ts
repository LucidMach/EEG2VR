import * as THREE from "three";
import { useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { capturePointer, releasePointer } from "./pointerCapture";

interface Params {
  gl: THREE.WebGLRenderer;
  groupRef: React.RefObject<THREE.Group | null>;
}

// WebXR drag-to-rotate and drag-to-position interaction for the headset group.
export function useXRDragInteraction({ gl, groupRef }: Params) {
  const isDraggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartRayDirRef = useRef(new THREE.Vector3());
  const dragStartQuatRef = useRef(new THREE.Quaternion());
  const dragOffsetRef = useRef(new THREE.Vector3());
  const dragDistanceRef = useRef(0);
  const xrPositionRef = useRef(new THREE.Vector3(0, 1.3, -1.1));
  const xrRotationRef = useRef(new THREE.Quaternion());

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!gl.xr.isPresenting) return;
    e.stopPropagation();
    capturePointer(e);

    isDraggingRef.current = true;
    pointerIdRef.current = e.pointerId;
    dragStartRayDirRef.current.copy(e.ray.direction);

    if (groupRef.current) {
      dragStartQuatRef.current.copy(groupRef.current.quaternion);

      // Grab distance/offset, so the drag doesn't snap the headset onto the ray.
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
    if (!groupRef.current) return;

    // Short-arc rotation aligning the drag's start ray direction to the current one.
    const qDiff = new THREE.Quaternion().setFromUnitVectors(dragStartRayDirRef.current, e.ray.direction);

    const rotatedOffset = dragOffsetRef.current.clone().applyQuaternion(qDiff);
    const newPos = new THREE.Vector3()
      .copy(e.ray.origin)
      .addScaledVector(e.ray.direction, dragDistanceRef.current)
      .add(rotatedOffset);
    groupRef.current.position.copy(newPos);
    xrPositionRef.current.copy(newPos);

    const newQuat = new THREE.Quaternion().multiplyQuaternions(qDiff, dragStartQuatRef.current);
    groupRef.current.quaternion.copy(newQuat);
    xrRotationRef.current.copy(newQuat);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerId !== pointerIdRef.current) return;
    e.stopPropagation();
    releasePointer(e);

    isDraggingRef.current = false;
    pointerIdRef.current = null;

    if (groupRef.current) {
      xrPositionRef.current.copy(groupRef.current.position);
      xrRotationRef.current.copy(groupRef.current.quaternion);
    }
  };

  return {
    isDraggingRef,
    xrPositionRef,
    xrRotationRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
