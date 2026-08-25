import React from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";

interface XRDashboardMeshProps {
  texture: THREE.CanvasTexture | null;
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
  width?: number;
  height?: number;
}

export const XRDashboardMesh: React.FC<XRDashboardMeshProps> = ({
  texture,
  onPointerDown,
  onPointerMove,
  onPointerOut,
  width = 0.96,
  height = 0.62,
}) => {
  return (
    <group position={[0, 0.72, -1.05]} rotation={[-Math.PI / 5, 0, 0]}>
      {/* 1. Thin Backing Plate for subtle depth */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Frameless Screen Plane with Canvas Texture */}
      {texture && (
        <mesh
          position={[0, 0, 0]}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerOut={onPointerOut}
        >
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            map={texture}
            toneMapped={false}
            side={THREE.FrontSide}
          />
        </mesh>
      )}

      {/* 3. Subtle Glass Highlight Overlay */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.1}
          transmission={0.95}
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default XRDashboardMesh;
