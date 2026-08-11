import * as THREE from "three";
import React from "react";
import type { ElectrodeName } from "../../utils/signalSource";

interface ElectrodeNodeProps {
  name: ElectrodeName;
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
  onRef: (name: ElectrodeName, mesh: THREE.Mesh | null) => void;
  onSelect?: (name: ElectrodeName) => void;
}

// One interactive LED sensor mesh on the digital twin. Its material's
// color/intensity/opacity are animated externally (see EEGHead's useFrame),
// which is why the mesh registers itself via `onRef` instead of holding its
// own ref.
const ElectrodeNode: React.FC<ElectrodeNodeProps> = ({
  name,
  geometry,
  position,
  rotation,
  onRef,
  onSelect,
}) => (
  <mesh
    castShadow
    receiveShadow
    geometry={geometry}
    position={position}
    rotation={rotation}
    scale={2.1}
    ref={(el) => onRef(name, el)}
    onClick={(e) => {
      e.stopPropagation();
      onSelect?.(name);
    }}
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
);

export default ElectrodeNode;
