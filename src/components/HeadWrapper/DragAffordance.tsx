import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface DragAffordanceProps {
  groupRef: React.RefObject<THREE.Group | null>;
  hoveredRef: React.RefObject<boolean>;
  hasDraggedRef?: React.RefObject<boolean>;
}

const HALO_RADIUS = 0.16;
const HALO_Y_OFFSET = 0.29;

// Frame-synced follower (same technique as XRCylinderWall's pointer
// reticle): copies the head's world position and rotation every frame rather
// than being parented under it, so the halo stays a fixed real-world size
// regardless of the head's own tiny XR scale (0.012, see useHeadPlacement).
export const DragAffordance: React.FC<DragAffordanceProps> = ({
  groupRef,
  hoveredRef,
}) => {
  const followerRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const follower = followerRef.current;
    const head = groupRef.current;
    if (!follower) return;

    const presenting = state.gl.xr.isPresenting;
    follower.visible = presenting;
    if (!presenting || !head) return;

    follower.position.copy(head.position);
    follower.quaternion.copy(head.quaternion);

    if (haloRef.current) {
      haloRef.current.visible = hoveredRef.current === true;
    }
  });

  return (
    <group ref={followerRef} visible={false}>
      {/* Hover halo: floating horizontally above the crown of the EEG headset */}
      <mesh
        ref={haloRef}
        visible={false}
        position={[0, HALO_Y_OFFSET, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[HALO_RADIUS - 0.008, HALO_RADIUS, 48]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default DragAffordance;
