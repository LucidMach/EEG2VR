import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
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

  const cardShape = useMemo(() => createPillShape(0.44, 0.22, 0.035), []);
  const pillShape = useMemo(() => createPillShape(0.34, 0.058, 0.029), []);

  const cardOutlineGeometry = useMemo(() => {
    const points = cardShape.getPoints(32);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [cardShape]);

  const pillOutlineGeometry = useMemo(() => {
    const points = pillShape.getPoints(24);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [pillShape]);

  return (
    <group position={[0, 0.76, -1.15]} rotation={[-Math.PI / 12, 0, 0]}>
      {/* 1. Frosted Translucent Backing Pod */}
      <mesh position={[0, 0, -0.006]}>
        <shapeGeometry args={[cardShape]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.25}
          metalness={0.2}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outermost Perimeter Contour Loop */}
      <lineLoop geometry={cardOutlineGeometry} position={[0, 0, -0.004]}>
        <lineBasicMaterial color="#334155" transparent opacity={0.5} />
      </lineLoop>

      {/* Title */}
      <Text
        position={[0, 0.068, 0.002]}
        fontSize={0.015}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        BRAINXR · SPATIAL EEG
      </Text>

      {/* 2. Primary "Run Demo Mode" Frosted Button */}
      <group
        position={[0, 0.012, 0]}
        onClick={(e) => {
          e.stopPropagation();
          triggerXRHaptic(e, 0.6, 25);
          onStartDemo?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setDemoHovered(true);
          triggerXRHaptic(e, 0.25, 10);
        }}
        onPointerOut={() => setDemoHovered(false)}
      >
        <mesh position={[0, 0, demoHovered ? 0.005 : 0]}>
          <shapeGeometry args={[pillShape]} />
          <meshStandardMaterial
            color={demoHovered ? "#2563eb" : "#1e293b"}
            roughness={0.2}
            metalness={0.2}
            transparent
            opacity={0.92}
            emissive={demoHovered ? "#1d4ed8" : "#000000"}
            emissiveIntensity={demoHovered ? 0.4 : 0}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Outermost Perimeter Loop */}
        <lineLoop
          geometry={pillOutlineGeometry}
          position={[0, 0, (demoHovered ? 0.005 : 0) + 0.001]}
        >
          <lineBasicMaterial
            color={demoHovered ? "#93c5fd" : "#475569"}
            transparent
            opacity={demoHovered ? 0.95 : 0.4}
          />
        </lineLoop>

        <Text
          position={[0, 0, (demoHovered ? 0.005 : 0) + 0.004]}
          fontSize={0.015}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Run Demo Mode
        </Text>
      </group>

      {/* 3. Secondary "Connect your EEG headset" Frosted Link */}
      <group
        position={[0, -0.045, 0.002]}
        onClick={(e) => {
          e.stopPropagation();
          triggerXRHaptic(e, 0.5, 20);
          onStartLive?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setLiveHovered(true);
          triggerXRHaptic(e, 0.2, 10);
        }}
        onPointerOut={() => setLiveHovered(false)}
      >
        <Text
          fontSize={0.012}
          color={liveHovered ? "#38bdf8" : "#94a3b8"}
          anchorX="center"
          anchorY="middle"
        >
          Connect your EEG headset
        </Text>
      </group>

      {/* 4. Exit XR Mode Link */}
      <group
        position={[0, -0.078, 0.002]}
        onClick={(e) => {
          e.stopPropagation();
          triggerXRHaptic(e, 0.5, 20);
          onExitXR?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setExitHovered(true);
          triggerXRHaptic(e, 0.2, 10);
        }}
        onPointerOut={() => setExitHovered(false)}
      >
        <Text
          fontSize={0.011}
          color={exitHovered ? "#f87171" : "#64748b"}
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
