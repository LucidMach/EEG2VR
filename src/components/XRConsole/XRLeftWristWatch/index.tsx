import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { Frame } from "../../../utils/signalSource";
import { triggerXRHaptic } from "../../../utils/xrHaptics";
import { useWatchDialTexture } from "./useWatchDialTexture";

interface XRLeftWristWatchProps {
  frameRef: React.RefObject<Frame>;
}

const _leftPos = new THREE.Vector3();
const _leftQuat = new THREE.Quaternion();
const _offsetVec = new THREE.Vector3(0.015, 0.04, -0.04);
const _fallbackPos = new THREE.Vector3(-0.35, 1.15, -0.65);
const _fallbackQuat = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(-Math.PI / 8, Math.PI / 6, 0)
);

export const XRLeftWristWatch: React.FC<XRLeftWristWatchProps> = ({
  frameRef,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const { texture } = useWatchDialTexture({ frameRef });

  useFrame((state) => {
    const group = rootRef.current;
    if (!group) return;

    const session = state.gl.xr.getSession();
    let tracked = false;

    if (session && state.gl.xr.isPresenting) {
      // Find left hand or left controller
      const inputSources = Array.from(session.inputSources || []);
      const leftSource = inputSources.find((src) => src.handedness === "left");

      if (leftSource) {
        // 1. Check controller instances from WebXRManager
        for (let i = 0; i < 2; i++) {
          const controller = state.gl.xr.getController(i);
          const grip = state.gl.xr.getControllerGrip(i);
          const source = (controller as any)?.userData?.inputSource;

          if (source?.handedness === "left" || (grip as any)?.userData?.inputSource?.handedness === "left") {
            const targetObj = grip?.visible ? grip : controller;
            if (targetObj && targetObj.visible) {
              targetObj.getWorldPosition(_leftPos);
              targetObj.getWorldQuaternion(_leftQuat);

              // Position watch slightly above left wrist/grip
              const localOffset = _offsetVec.clone().applyQuaternion(_leftQuat);
              _leftPos.add(localOffset);

              group.position.lerp(_leftPos, 0.4);
              group.quaternion.slerp(_leftQuat, 0.4);
              tracked = true;
              break;
            }
          }
        }
      }
    }

    // 2. Comfortable floating fallback in lower-left FOV if hand/controller is not detected
    if (!tracked) {
      group.position.lerp(_fallbackPos, 0.1);
      group.quaternion.slerp(_fallbackQuat, 0.1);
    }
  });

  const handleWatchClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.5, 20);
  };

  const watchRadius = 0.048; // ~9.6cm diameter smartwatch face
  const caseRadius = 0.054;

  return (
    <group ref={rootRef} position={[-0.35, 1.15, -0.65]} rotation={[-Math.PI / 8, Math.PI / 6, 0]}>
      {/* 1. Watch Body / Bezel Chassis (Dark Titanium) */}
      <mesh position={[0, 0, -0.006]} castShadow receiveShadow>
        <cylinderGeometry args={[caseRadius, caseRadius * 0.95, 0.012, 32]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.25}
          metalness={0.8}
        />
      </mesh>

      {/* Decorative Outer Bezel Accent */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[watchRadius, caseRadius, 32]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.3}
          metalness={0.9}
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
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Watch Strap / Band (Curved Wrist Mount) */}
      <mesh position={[0, caseRadius + 0.02, -0.008]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.038, 0.04, 0.006]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, -(caseRadius + 0.02), -0.008]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.038, 0.04, 0.006]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  );
};

export default XRLeftWristWatch;
