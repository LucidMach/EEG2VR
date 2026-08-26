import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { ELECTRODE_METADATA, type ElectrodeName } from "../../utils/signalSource";
import { REGION_COLOR } from "../../utils/electrodeVisualState";
import { triggerXRHaptic } from "../../utils/xrHaptics";

interface ElectrodeNodeProps {
  name: ElectrodeName;
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
  isSelected?: boolean;
  isHovered?: boolean;
  onRef: (name: ElectrodeName, mesh: THREE.Mesh | null) => void;
  onSelect?: (name: ElectrodeName) => void;
  onHover?: (name: ElectrodeName | null) => void;
}

// Interactive LED sensor mesh on the digital twin. Its material's
// color/intensity/opacity are animated externally (see EEGHead's useFrame),
// which is why the mesh registers itself via `onRef`.
//
// When selected (or hovered), renders a concentric 3D glowing torus collar
// and halo ring around the sensor base with cortical region-themed illumination.
const ElectrodeNode: React.FC<ElectrodeNodeProps> = ({
  name,
  geometry,
  position,
  rotation,
  isSelected = false,
  isHovered = false,
  onRef,
  onSelect,
  onHover,
}) => {
  const ringGroupRef = useRef<THREE.Group>(null);

  const { radius, ringRotation } = useMemo(() => {
    if (!geometry.boundingSphere) {
      geometry.computeBoundingSphere();
    }
    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }
    const r = geometry.boundingSphere?.radius ?? 0.8;
    const bb = geometry.boundingBox;
    let rot: [number, number, number] = [0, 0, 0];
    if (bb) {
      const dx = bb.max.x - bb.min.x;
      const dy = bb.max.y - bb.min.y;
      const dz = bb.max.z - bb.min.z;
      // If the dome axis is Y (min dimension is dy), rotate ring to lie in XZ plane
      if (dy < dx && dy < dz) {
        rot = [Math.PI / 2, 0, 0];
      } else if (dx < dy && dx < dz) {
        // If dome axis is X, rotate ring to lie in YZ plane
        rot = [0, Math.PI / 2, 0];
      }
    }
    return { radius: r, ringRotation: rot };
  }, [geometry]);

  const region = ELECTRODE_METADATA[name]?.region;
  const ringColor = (region && REGION_COLOR[region]) || "#38bdf8";

  useFrame((state) => {
    if (!ringGroupRef.current) return;
    if (isSelected) {
      const time = state.clock.getElapsedTime();
      const pulse = Math.sin(time * 5);
      const s = 1.0 + 0.05 * pulse;
      ringGroupRef.current.scale.set(s, s, s);
    } else {
      ringGroupRef.current.scale.set(1, 1, 1);
    }
  });

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.5, 25);
    onSelect?.(name);
  };

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.2, 10);
    onHover?.(name);
  };

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover?.(null);
  };

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Base Electrode Sensor LED Hemisphere */}
      <mesh
        castShadow
        receiveShadow
        geometry={geometry}
        scale={2.1}
        ref={(el) => onRef(name, el)}
        onClick={handleClick}
        onPointerDown={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.15}
          metalness={0.1}
          emissive={new THREE.Color("#000000")}
          emissiveIntensity={0.0}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 2. Concentric Highlight Ring (Active Selection / Hover Preview) */}
      {(isSelected || isHovered) && (
        <group ref={ringGroupRef} rotation={ringRotation} scale={2.1}>
          {/* 3D Glowing Torus Collar surrounding the LED base */}
          <mesh raycast={() => null}>
            <torusGeometry args={[radius * 1.06, radius * 0.1, 16, 32]} />
            <meshStandardMaterial
              color={ringColor}
              emissive={ringColor}
              emissiveIntensity={isSelected ? 1.6 : 0.7}
              roughness={0.1}
              metalness={0.2}
              transparent
              opacity={isSelected ? 0.95 : 0.6}
            />
          </mesh>

          {/* Outer glowing halo ring aura */}
          <mesh raycast={() => null}>
            <ringGeometry args={[radius * 1.14, radius * 1.42, 32]} />
            <meshBasicMaterial
              color={ringColor}
              side={THREE.DoubleSide}
              transparent
              opacity={isSelected ? 0.55 : 0.28}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default React.memo(ElectrodeNode);
