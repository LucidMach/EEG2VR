import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
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

  return (
    <group position={[0, 0.72, -1.2]} rotation={[-Math.PI / 12, 0, 0]}>
      {/* 1. Primary "Run Demo Mode" Pill Button */}
      <group
        position={[0, 0.04, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onStartDemo?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setDemoHovered(true);
        }}
        onPointerOut={() => setDemoHovered(false)}
      >
        <mesh position={[0, 0, demoHovered ? 0.004 : 0]}>
          <shapeGeometry args={[pillShape]} />
          <meshStandardMaterial
            color={demoHovered ? "#334155" : "#1e293b"}
            roughness={0.2}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        <Text
          position={[0, 0, demoHovered ? 0.008 : 0.004]}
          fontSize={0.015}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Run Demo Mode
        </Text>
      </group>

      {/* 2. Secondary "Connect your EEG headset" Text Link */}
      <group
        position={[0, -0.025, 0.002]}
        onClick={(e) => {
          e.stopPropagation();
          onStartLive?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setLiveHovered(true);
        }}
        onPointerOut={() => setLiveHovered(false)}
      >
        <Text
          fontSize={0.012}
          color={liveHovered ? "#0f172a" : "#475569"}
          anchorX="center"
          anchorY="middle"
        >
          Connect your EEG headset
        </Text>
      </group>

      {/* 3. Exit XR Mode Link */}
      <group
        position={[0, -0.065, 0.002]}
        onClick={(e) => {
          e.stopPropagation();
          onExitXR?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setExitHovered(true);
        }}
        onPointerOut={() => setExitHovered(false)}
      >
        <Text
          fontSize={0.011}
          color={exitHovered ? "#dc2626" : "#94a3b8"}
          anchorX="center"
          anchorY="middle"
        >
          ✕ Exit XR Mode
        </Text>
      </group>
    </group>
  );
};

export default IdleActionsXR;
