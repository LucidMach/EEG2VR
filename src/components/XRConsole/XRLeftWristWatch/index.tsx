import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { useXRInputSourceState } from "@react-three/xr";
import type { Frame } from "../../../utils/signalSource";
import { triggerXRHaptic } from "../../../utils/xrHaptics";
import { useWatchDialTexture } from "./useWatchDialTexture";

interface XRLeftWristWatchProps {
  frameRef: React.RefObject<Frame>;
}

const _tempPos = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();
const _localOffset = new THREE.Vector3(0.015, 0.04, -0.05);
const _rotOffset = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(-Math.PI / 4, 0, Math.PI / 8)
);
const _fallbackPos = new THREE.Vector3(-0.28, 1.15, -0.6);
const _fallbackQuat = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(-Math.PI / 8, Math.PI / 6, 0)
);

export const XRLeftWristWatch: React.FC<XRLeftWristWatchProps> = ({
  frameRef,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const { texture } = useWatchDialTexture({ frameRef });

  const leftControllerState = useXRInputSourceState("controller", "left");
  const leftHandState = useXRInputSourceState("hand", "left");

  useFrame((state) => {
    const group = rootRef.current;
    if (!group) return;

    let attached = false;

    // 1. Try tracking via WebXRManager controllers / hand grips
    if (state.gl.xr.isPresenting) {
      // Check gl.xr controllers & grips
      for (let i = 0; i < 2; i++) {
        const controller = state.gl.xr.getController(i);
        const grip = state.gl.xr.getControllerGrip(i);
        const hand = (state.gl.xr as any).getHand?.(i);

        const inputSource =
          (controller as any)?.userData?.inputSource ||
          (grip as any)?.userData?.inputSource ||
          (hand as any)?.userData?.inputSource ||
          (i === 0 ? leftControllerState?.inputSource : leftHandState?.inputSource);

        if (inputSource?.handedness === "left") {
          // If hand tracking joint 'wrist' exists
          if (inputSource.hand) {
            const wristJoint = (hand as any)?.joints?.["wrist"] || hand;
            if (wristJoint && wristJoint.visible !== false) {
              wristJoint.getWorldPosition(_tempPos);
              wristJoint.getWorldQuaternion(_tempQuat);
              attached = true;
            }
          }

          if (!attached) {
            const targetObj = grip?.visible ? grip : controller;
            if (targetObj) {
              targetObj.getWorldPosition(_tempPos);
              targetObj.getWorldQuaternion(_tempQuat);
              attached = true;
            }
          }

          if (attached) {
            // Apply ergonomic watch offset for left wrist / forearm
            const offset = _localOffset.clone().applyQuaternion(_tempQuat);
            _tempPos.add(offset);
            _tempQuat.multiply(_rotOffset);

            group.position.lerp(_tempPos, 0.4);
            group.quaternion.slerp(_tempQuat, 0.4);
            break;
          }
        }
      }
    }

    // 2. Comfortable floating fallback in lower-left FOV if left hand/controller is not present
    if (!attached) {
      group.position.lerp(_fallbackPos, 0.1);
      group.quaternion.slerp(_fallbackQuat, 0.1);
    }
  });

  const handleWatchClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.5, 20);
  };

  const watchRadius = 0.052; // ~10.4cm diameter watch face
  const caseRadius = 0.058;

  return (
    <group ref={rootRef} position={[-0.28, 1.15, -0.6]} rotation={[-Math.PI / 8, Math.PI / 6, 0]}>
      {/* 1. Watch Body / Bezel Chassis (Dark Slate matching web TrialDial knob) */}
      <mesh position={[0, 0, -0.006]} castShadow receiveShadow>
        <cylinderGeometry args={[caseRadius, caseRadius * 0.96, 0.014, 32]} />
        <meshStandardMaterial
          color="#020617"
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      {/* Decorative Bezel Rim */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[watchRadius, caseRadius, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.3}
          metalness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Interactive OLED Display Surface with Focus Dial */}
      {texture && (
        <mesh position={[0, 0, 0.002]} onClick={handleWatchClick}>
          <circleGeometry args={[watchRadius, 32]} />
          <meshBasicMaterial
            map={texture}
            toneMapped={false}
            side={THREE.FrontSide}
          />
        </mesh>
      )}

      {/* 3. Protective Crystal Watch Glass */}
      <mesh position={[0, 0, 0.003]}>
        <circleGeometry args={[caseRadius, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          metalness={0.1}
          transmission={0.96}
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Watch Strap / Band (Curved Wrist Mount) */}
      <mesh position={[0, caseRadius + 0.018, -0.008]}>
        <boxGeometry args={[0.04, 0.036, 0.008]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, -(caseRadius + 0.018), -0.008]}>
        <boxGeometry args={[0.04, 0.036, 0.008]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  );
};

export default XRLeftWristWatch;
