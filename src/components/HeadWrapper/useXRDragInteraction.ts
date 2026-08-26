import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { capturePointer, releasePointer } from "./pointerCapture";

export interface XRDragInteractionParams {
  gl: THREE.WebGLRenderer;
  groupRef: React.RefObject<THREE.Group | null>;
  initialPosition?: THREE.Vector3 | [number, number, number];
  initialRotation?: THREE.Quaternion | THREE.Euler | [number, number, number];
  onDragStart?: (e: ThreeEvent<PointerEvent>) => void;
  onDragEnd?: (e: ThreeEvent<PointerEvent>) => void;
}

const _qDiff = new THREE.Quaternion();
const _rotatedOffset = new THREE.Vector3();
const _newPos = new THREE.Vector3();
const _newQuat = new THREE.Quaternion();
const _initialRayPoint = new THREE.Vector3();

function toVector3(
  pos?: THREE.Vector3 | [number, number, number],
  fallback: THREE.Vector3 = new THREE.Vector3(0, 1.3, -1.1)
): THREE.Vector3 {
  if (!pos) return fallback.clone();
  if (pos instanceof THREE.Vector3) return pos.clone();
  return new THREE.Vector3(pos[0], pos[1], pos[2]);
}

function toQuaternion(
  rot?: THREE.Quaternion | THREE.Euler | [number, number, number],
  fallback: THREE.Quaternion = new THREE.Quaternion()
): THREE.Quaternion {
  if (!rot) return fallback.clone();
  if (rot instanceof THREE.Quaternion) return rot.clone();
  if (rot instanceof THREE.Euler) return new THREE.Quaternion().setFromEuler(rot);
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
}

// WebXR drag-to-rotate and drag-to-position interaction for spatial groups.
export function useXRDragInteraction({
  gl,
  groupRef,
  initialPosition,
  initialRotation,
  onDragStart,
  onDragEnd,
}: XRDragInteractionParams) {
  const defaultPos = useRef(toVector3(initialPosition, new THREE.Vector3(0, 1.3, -1.1))).current;
  const defaultQuat = useRef(toQuaternion(initialRotation, new THREE.Quaternion())).current;

  const isDraggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartRayDirRef = useRef(new THREE.Vector3());
  const dragStartQuatRef = useRef(new THREE.Quaternion());
  const dragOffsetRef = useRef(new THREE.Vector3());
  const dragDistanceRef = useRef(0);
  const xrPositionRef = useRef(defaultPos.clone());
  const xrRotationRef = useRef(defaultQuat.clone());
  const wasPresentingRef = useRef(false);

  useFrame((state) => {
    const isPresenting = state.gl.xr.isPresenting;
    if (!isPresenting) {
      wasPresentingRef.current = false;
      return;
    }

    if (!wasPresentingRef.current) {
      xrPositionRef.current.copy(defaultPos);
      xrRotationRef.current.copy(defaultQuat);
      wasPresentingRef.current = true;
    }

    if (groupRef.current && !isDraggingRef.current) {
      groupRef.current.position.copy(xrPositionRef.current);
      groupRef.current.quaternion.copy(xrRotationRef.current);
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!gl.xr.isPresenting) return;
    e.stopPropagation();
    capturePointer(e);

    isDraggingRef.current = true;
    pointerIdRef.current = e.pointerId;
    dragStartRayDirRef.current.copy(e.ray.direction);

    if (groupRef.current) {
      dragStartQuatRef.current.copy(groupRef.current.quaternion);

      // Grab distance/offset, so the drag doesn't snap the group onto the ray.
      const grabDistance = e.ray.origin.distanceTo(groupRef.current.position);
      dragDistanceRef.current = grabDistance;
      _initialRayPoint
        .copy(e.ray.origin)
        .addScaledVector(e.ray.direction, grabDistance);
      dragOffsetRef.current.subVectors(groupRef.current.position, _initialRayPoint);
    }

    onDragStart?.(e);
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

    onDragEnd?.(e);
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
