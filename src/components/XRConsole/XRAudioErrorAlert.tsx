import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { createPillShape } from "./pillShape";

interface XRAudioErrorAlertProps {
  audioError: boolean;
}

export const XRAudioErrorAlert: React.FC<XRAudioErrorAlertProps> = ({ audioError }) => {
  const pulseRef = useRef<THREE.MeshBasicMaterial>(null);

  const pillShape = useMemo(() => createPillShape(0.46, 0.046, 0.023), []);
  const outlineGeo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(pillShape.getPoints(32)),
    [pillShape]
  );

  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const pulse = 0.6 + 0.4 * Math.sin(clock.getElapsedTime() * 5);
      pulseRef.current.opacity = pulse;
    }
  });

  if (!audioError) return null;

  // Sits just above XRControlBar's top edge (centered at y=1.02, height
  // 0.31 → top ~1.15) under the digital twin (base y=1.30).
  return (
    <group position={[0, 1.20, -1.05]} rotation={[-Math.PI / 6, 0, 0]}>
      {/* 1. Frosted Translucent Alert Card Backing */}
      <mesh position={[0, 0, -0.004]}>
        <shapeGeometry args={[pillShape]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outermost Wireframe Perimeter Outline (Red Alert Accent) */}
      <lineLoop geometry={outlineGeo} position={[0, 0, -0.002]}>
        <lineBasicMaterial color="#ef4444" transparent opacity={0.65} />
      </lineLoop>

      {/* 2. Pulsing Red Status LED */}
      <mesh position={[-0.18, 0, 0.003]}>
        <circleGeometry args={[0.006, 16]} />
        <meshBasicMaterial
          ref={pulseRef}
          color="#ef4444"
          transparent
          opacity={1.0}
        />
      </mesh>

      {/* 3. Bold Alert Title */}
      <Text
        position={[-0.16, 0, 0.004]}
        fontSize={0.012}
        color="#ef4444"
        anchorX="left"
        anchorY="middle"
      >
        AUDIO UNAVAILABLE
      </Text>

      {/* Divider Separator */}
      <mesh position={[-0.032, 0, 0.003]}>
        <planeGeometry args={[0.001, 0.02]} />
        <meshBasicMaterial color="#334155" transparent opacity={0.8} />
      </mesh>

      {/* 4. Alert Explanation Subtitle */}
      <Text
        position={[-0.018, 0, 0.004]}
        fontSize={0.010}
        color="#cbd5e1"
        anchorX="left"
        anchorY="middle"
      >
        Audio file for this trial was not found
      </Text>
    </group>
  );
};

export default XRAudioErrorAlert;
