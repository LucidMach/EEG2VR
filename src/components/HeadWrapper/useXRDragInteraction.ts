import * as THREE from "three";
import { useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { capturePointer, releasePointer } from "./pointerCapture";

interface Params {
  gl: THREE.WebGLRenderer;
  groupRef: React.RefObject<THREE.Group | null>;
}

const _qDiff = new THREE.Quaternion();
const _rotatedOffset = new THREE.Vector3();
const _newPos = new THREE.Vector3();
const _newQuat = new THREE.Quaternion();
const _initialRayPoint = new THREE.Vector3();

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
      _initialRayPoint
        .copy(e.ray.origin)
        .addScaledVector(e.ray.direction, grabDistance);
      dragOffsetRef.current.subVectors(groupRef.current.position, _initialRayPoint);
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current || e.pointerId !== pointerIdRef.current) return;
    e.stopPropagation();
    if (!groupRef.current) return;

    // Short-arc rotation aligning the drag's start ray direction to the current one.
    _qDiff.setFromUnitVectors(dragStartRayDirRef.current, e.ray.direction);

    _rotatedOffset.copy(dragOffsetRef.current).applyQuaternion(_qDiff);
    _newPos
      .copy(e.ray.origin)
      .addScaledVector(e.ray.direction, dragDistanceRef.current)
      .add(_rotatedOffset);

    // Only commit to full displacement if moved beyond small deadzone
    if (_newPos.distanceTo(xrPositionRef.current) > 0.015) {
      groupRef.current.position.copy(_newPos);
      xrPositionRef.current.copy(_newPos);

      _newQuat.multiplyQuaternions(_qDiff, dragStartQuatRef.current);
      groupRef.current.quaternion.copy(_newQuat);
      xrRotationRef.current.copy(_newQuat);
    }
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
