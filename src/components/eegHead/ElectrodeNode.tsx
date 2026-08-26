import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { ELECTRODE_METADATA, type ElectrodeName } from "../../utils/signalSource";
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

const REGION_HALO_COLORS: Record<string, string> = {
  Frontal: "#818cf8",   // Indigo
  Temporal: "#c084fc",  // Purple
  Central: "#60a5fa",   // Blue
  Parietal: "#22d3ee",   // Cyan
  Occipital: "#34d399", // Emerald
};

// One interactive LED sensor mesh on the digital twin.
// Color/intensity/opacity are animated externally (see EEGHead's useFrame),
// and when selected or hovered, renders an animated, luminous halo aura.
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
  const haloShellRef = useRef<THREE.Mesh>(null);
  const haloOuterRef = useRef<THREE.Mesh>(null);
  const haloMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const haloOuterMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const meta = ELECTRODE_METADATA[name];
  const haloColor = (meta && REGION_HALO_COLORS[meta.region]) || "#38bdf8";

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.5, 25);
    onSelect?.(name);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
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

  // Subtle breathing pulse for active halo aura
  useFrame((state) => {
    if (!isSelected && !isHovered) return;
    const time = state.clock.getElapsedTime();
    const pulse = Math.sin(time * 3.5);

    if (haloShellRef.current) {
      const baseScale = isSelected ? 2.6 : 2.35;
      const pulseDelta = isSelected ? 0.12 * pulse : 0.04 * pulse;
      haloShellRef.current.scale.setScalar(baseScale + pulseDelta);
    }

    if (haloOuterRef.current) {
      const baseOuterScale = isSelected ? 3.1 : 2.7;
      const pulseDelta = isSelected ? 0.2 * pulse : 0.06 * pulse;
      haloOuterRef.current.scale.setScalar(baseOuterScale + pulseDelta);
    }

    if (haloMatRef.current) {
      const baseOpacity = isSelected ? 0.65 : 0.3;
      haloMatRef.current.opacity = baseOpacity + (isSelected ? 0.2 * pulse : 0.08 * pulse);
    }

    if (haloOuterMatRef.current) {
      const baseOpacity = isSelected ? 0.25 : 0.1;
      haloOuterMatRef.current.opacity = baseOpacity + (isSelected ? 0.1 * pulse : 0.03 * pulse);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Base LED Sensor Mesh */}
      <mesh
        castShadow
        receiveShadow
        geometry={geometry}
        scale={2.1}
        ref={(el) => onRef(name, el)}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
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

      {/* 2. Inner Glowing Halo Shell */}
      {(isSelected || isHovered) && (
        <mesh
          ref={haloShellRef}
          geometry={geometry}
          scale={isSelected ? 2.6 : 2.35}
          raycast={() => null}
        >
          <meshBasicMaterial
            ref={haloMatRef}
            color={haloColor}
            transparent
            opacity={isSelected ? 0.65 : 0.3}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 3. Outer Radiant Aura Corona Shell */}
      {(isSelected || isHovered) && (
        <mesh
          ref={haloOuterRef}
          geometry={geometry}
          scale={isSelected ? 3.1 : 2.7}
          raycast={() => null}
        >
          <meshBasicMaterial
            ref={haloOuterMatRef}
            color={haloColor}
            transparent
            opacity={isSelected ? 0.25 : 0.1}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 4. Local Illuminating Point Light for Selected State */}
      {isSelected && (
        <pointLight
          color={haloColor}
          intensity={1.2}
          distance={2.5}
          decay={2}
        />
      )}
    </group>
  );
};

export default ElectrodeNode;
