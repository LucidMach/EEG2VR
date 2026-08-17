import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface IdleActionsXRProps {
  onStartDemo?: () => void;
  onStartLive?: () => void;
}

// Helper to construct a 2D rounded-rectangle / capsule (pill) shape
function createPillShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

// 3D WebXR replica of IdleActions (bottom-center layout, pill button + text link)
export const IdleActionsXR: React.FC<IdleActionsXRProps> = ({ onStartDemo, onStartLive }) => {
  const [demoHovered, setDemoHovered] = useState(false);
  const [liveHovered, setLiveHovered] = useState(false);

  // Pill shape for the "Run Demo Mode" button (rounded-full)
  const pillShape = useMemo(() => createPillShape(0.34, 0.062, 0.031), []);

  return (
    <group position={[0, 0.75, -1.5]} rotation={[-Math.PI / 16, 0, 0]}>
      {/* 1. Primary "Run Demo Mode" Pill Button */}
      <group
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onStartDemo?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setDemoHovered(true);
          if (typeof document !== "undefined") document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setDemoHovered(false);
          if (typeof document !== "undefined") document.body.style.cursor = "auto";
        }}
      >
        {/* Rounded Pill Mesh (dark slate bg-slate-800 -> hover bg-slate-700) */}
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
          font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
        >
          Run Demo Mode
        </Text>
      </group>

      {/* 2. Secondary "Connect your EEG headset" Text Link */}
      <group
        position={[0, -0.058, 0.002]}
        onClick={(e) => {
          e.stopPropagation();
          onStartLive?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setLiveHovered(true);
          if (typeof document !== "undefined") document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setLiveHovered(false);
          if (typeof document !== "undefined") document.body.style.cursor = "auto";
        }}
      >
        <Text
          fontSize={0.012}
          color={liveHovered ? "#0f172a" : "#475569"}
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
        >
          Connect your EEG headset
        </Text>
      </group>
    </group>
  );
};

export default IdleActionsXR;
