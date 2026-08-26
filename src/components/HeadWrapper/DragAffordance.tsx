import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

interface DragAffordanceProps {
  groupRef: React.RefObject<THREE.Group | null>;
  hoveredRef: React.RefObject<boolean>;
  hasDraggedRef: React.RefObject<boolean>;
}

const HALO_RADIUS = 0.16;
const HINT_Y_OFFSET = -0.22;

// Frame-synced follower (same technique as XRCylinderWall's pointer
// reticle): copies the head's world position every frame rather than being
// parented under it, so the halo/hint stay a fixed real-world size
// regardless of the head's own tiny XR scale (0.012, see useHeadPlacement).
export const DragAffordance: React.FC<DragAffordanceProps> = ({
  groupRef,
  hoveredRef,
  hasDraggedRef,
}) => {
  const followerRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const hintRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const follower = followerRef.current;
    const head = groupRef.current;
    if (!follower) return;

    const presenting = state.gl.xr.isPresenting;
    follower.visible = presenting;
    if (!presenting || !head) return;

    follower.position.copy(head.position);

    if (haloRef.current) {
      haloRef.current.visible = hoveredRef.current === true;
    }
    if (hintRef.current) {
      hintRef.current.visible = hasDraggedRef.current !== true;
    }
  });

  return (
    <group ref={followerRef} visible={false}>
      {/* Hover halo: the only signal that the head can be grabbed at all */}
      <mesh ref={haloRef} visible={false}>
        <ringGeometry args={[HALO_RADIUS - 0.006, HALO_RADIUS, 48]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* One-time hint, retired for good after the first successful drag */}
      <group ref={hintRef} position={[0, HINT_Y_OFFSET, 0]}>
        <Text
          fontSize={0.014}
          color="#cbd5e1"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.0015}
          outlineColor="#0f172a"
          outlineOpacity={0.8}
        >
          Grab an electrode to reposition
        </Text>
      </group>
    </group>
  );
};

export default DragAffordance;
