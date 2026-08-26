import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { triggerXRHaptic } from "../../utils/xrHaptics";
import { createPillShape } from "./pillShape";

interface IdleActionsXRProps {
  onStartDemo?: () => void;
  onStartLive?: () => void;
  onExitXR?: () => void;
}

export const IdleActionsXR: React.FC<IdleActionsXRProps> = ({
  onStartDemo,
  onStartLive,
  onExitXR,
}) => {
  const [demoHovered, setDemoHovered] = useState(false);
  const [liveHovered, setLiveHovered] = useState(false);
  const [exitHovered, setExitHovered] = useState(false);

  const pillShape = useMemo(() => createPillShape(0.34, 0.062, 0.031), []);
  const outlineGeo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(pillShape.getPoints(32)),
    [pillShape]
  );

  const handleDemoClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.6, 25);
    onStartDemo?.();
  };

  const handleDemoPointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDemoHovered(true);
    triggerXRHaptic(e, 0.25, 10);
  };

  const handleDemoPointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDemoHovered(false);
  };

  const handleLiveClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.6, 25);
    onStartLive?.();
  };

  const handleLivePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setLiveHovered(true);
    triggerXRHaptic(e, 0.25, 10);
  };

  const handleLivePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setLiveHovered(false);
  };

  const handleExitClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.6, 25);
    onExitXR?.();
  };

  const handleExitPointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setExitHovered(true);
    triggerXRHaptic(e, 0.25, 10);
  };

  const handleExitPointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setExitHovered(false);
  };

  return (
    <group position={[0, 0.72, -1.2]} rotation={[-Math.PI / 12, 0, 0]}>
      {/* 1. Primary "Run Demo Mode" Pill Button */}
      <group position={[0, 0.04, 0]}>
        <mesh
          position={[0, 0, demoHovered ? 0.004 : 0]}
          onClick={handleDemoClick}
          onPointerDown={(e) => {
            e.stopPropagation();
            triggerXRHaptic(e, 0.35, 15);
          }}
          onPointerEnter={handleDemoPointerEnter}
          onPointerLeave={handleDemoPointerLeave}
        >
          <shapeGeometry args={[pillShape]} />
          <meshStandardMaterial
            color={demoHovered ? "#334155" : "#1e293b"}
            roughness={0.2}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        {demoHovered && (
          <lineLoop
            geometry={outlineGeo}
            position={[0, 0, 0.006]}
            raycast={() => null}
          >
            <lineBasicMaterial color="#60a5fa" />
          </lineLoop>
        )}
        <Text
          position={[0, 0, demoHovered ? 0.008 : 0.004]}
          fontSize={0.015}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          raycast={() => null}
        >
          Run Demo Mode
        </Text>
      </group>

      {/* 2. Secondary "Connect your EEG headset" Text Link */}
      <group position={[0, -0.025, 0.002]}>
        {/* Invisible hit plane for reliable raycasting */}
        <mesh
          position={[0, 0, 0]}
          onClick={handleLiveClick}
          onPointerDown={(e) => {
            e.stopPropagation();
            triggerXRHaptic(e, 0.35, 15);
          }}
          onPointerEnter={handleLivePointerEnter}
          onPointerLeave={handleLivePointerLeave}
        >
          <planeGeometry args={[0.3, 0.035]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <Text
          fontSize={0.012}
          color={liveHovered ? "#38bdf8" : "#94a3b8"}
          anchorX="center"
          anchorY="middle"
          raycast={() => null}
        >
          Connect your EEG headset
        </Text>
      </group>

      {/* 3. Exit XR Mode Link */}
      <group position={[0, -0.065, 0.002]}>
        {/* Invisible hit plane for reliable raycasting */}
        <mesh
          position={[0, 0, 0]}
          onClick={handleExitClick}
          onPointerDown={(e) => {
            e.stopPropagation();
            triggerXRHaptic(e, 0.35, 15);
          }}
          onPointerEnter={handleExitPointerEnter}
          onPointerLeave={handleExitPointerLeave}
        >
          <planeGeometry args={[0.22, 0.035]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <Text
          fontSize={0.011}
          color={exitHovered ? "#dc2626" : "#64748b"}
          anchorX="center"
          anchorY="middle"
          raycast={() => null}
        >
          ✕ Exit XR Mode
        </Text>
      </group>
    </group>
  );
};

export default IdleActionsXR;

