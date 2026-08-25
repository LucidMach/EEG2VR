import React from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";

interface XRDashboardMeshProps {
  texture: THREE.CanvasTexture | null;
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  width?: number;
  height?: number;
}

export const XRDashboardMesh: React.FC<XRDashboardMeshProps> = ({
  texture,
  onPointerDown,
  width = 0.96,
  height = 0.62,
}) => {
  const depth = 0.02;
  const bezel = 0.03;

  return (
    <group position={[0, 0.72, -1.05]} rotation={[-Math.PI / 5, 0, 0]}>
      {/* 1. Outer Beveled Housing */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width + bezel * 2, height + bezel * 2, depth]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Inner Frame Trim */}
      <mesh position={[0, 0, depth / 2 + 0.001]}>
        <planeGeometry args={[width + 0.01, height + 0.01]} />
        <meshBasicMaterial color="#e2e8f0" />
      </mesh>

      {/* 3. Screen Plane with Canvas Texture */}
      {texture && (
        <mesh
          position={[0, 0, depth / 2 + 0.002]}
          onPointerDown={onPointerDown}
        >
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            map={texture}
            toneMapped={false}
            side={THREE.FrontSide}
          />
        </mesh>
      )}

      {/* 4. Subtle Glass Highlight Overlay */}
      <mesh position={[0, 0, depth / 2 + 0.003]}>
        <planeGeometry args={[width, height]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default XRDashboardMesh;
