import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { ElectrodeName, Frame } from "../../../utils/signalSource";
import type { HistorySample } from "../../../hooks/usePlaybackEngine";
import { triggerXRHaptic } from "../../../utils/xrHaptics";
import type { CylinderChannelHitArea } from "./types";
import { useXRCylinderTexture } from "./useXRCylinderTexture";

interface XRCylinderWallProps {
  frameRef: React.RefObject<Frame>;
  historiesRef?: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  selectedChannel: ElectrodeName | null;
  hoveredChannel?: ElectrodeName | null;
  onChannelSelect?: (name: ElectrodeName) => void;
  onChannelHover?: (name: ElectrodeName | null) => void;
  radius?: number;
  height?: number;
}

const _lookTarget = new THREE.Vector3(0, 1.35, 0);

export const XRCylinderWall: React.FC<XRCylinderWallProps> = ({
  frameRef,
  historiesRef,
  selectedChannel,
  hoveredChannel,
  onChannelSelect,
  onChannelHover,
  radius = 3.6,
  height = 2.4,
}) => {
  const hitAreasRef = useRef<CylinderChannelHitArea[]>([]);
  const hoveredChannelRef = useRef<ElectrodeName | null>(hoveredChannel ?? null);
  const reticleGroupRef = useRef<THREE.Group>(null);
  const hitPointRef = useRef<THREE.Vector3 | null>(null);
  const isHoveredRef = useRef<boolean>(false);

  // Sync external hover state when not actively hovering locally
  if (!isHoveredRef.current && hoveredChannelRef.current !== (hoveredChannel ?? null)) {
    hoveredChannelRef.current = hoveredChannel ?? null;
  }

  const { texture } = useXRCylinderTexture({
    frameRef,
    historiesRef,
    selectedChannel,
    hoveredChannelRef,
    hitAreasRef,
  });

  const getChannelAtUV = (uv: THREE.Vector2): ElectrodeName | null => {
    // In Three.js cylinder geometry, UV.y = 1 is top, UV.y = 0 is bottom.
    // Canvas Y = 0 is top, Canvas Y = Height is bottom.
    const canvasYFraction = 1 - uv.y;
    for (const area of hitAreasRef.current) {
      if (canvasYFraction >= area.yMin && canvasYFraction <= area.yMax) {
        return area.name;
      }
    }
    return null;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!e.uv || !e.point) return;

    isHoveredRef.current = true;
    if (!hitPointRef.current) {
      hitPointRef.current = e.point.clone();
    } else {
      hitPointRef.current.copy(e.point);
    }

    const channel = getChannelAtUV(e.uv);
    if (channel !== hoveredChannelRef.current) {
      hoveredChannelRef.current = channel;
      onChannelHover?.(channel);
      if (channel) {
        triggerXRHaptic(e, 0.2, 10);
      }
    }
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isHoveredRef.current = false;
    if (hoveredChannelRef.current !== null) {
      hoveredChannelRef.current = null;
      onChannelHover?.(null);
    }
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!e.uv) return;

    const channel = getChannelAtUV(e.uv);
    if (channel) {
      triggerXRHaptic(e, 0.5, 25);
      onChannelSelect?.(channel);
    }
  };

  // Update visible pointer reticle position on cylinder
  useFrame(() => {
    const reticle = reticleGroupRef.current;
    if (!reticle) return;

    if (isHoveredRef.current && hitPointRef.current) {
      reticle.visible = true;
      reticle.position.copy(hitPointRef.current);
      reticle.lookAt(_lookTarget);
    } else {
      reticle.visible = false;
    }
  });

  // Panoramic curved arc spanning ~160° around the user's field of view
  const thetaStart = Math.PI * 0.55;
  const thetaLength = Math.PI * 0.9;

  return (
    <group position={[0, 1.35, 0]}>
      {/* 1. Frosted Translucent Backing Panel */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry
          args={[
            radius + 0.01,
            radius + 0.01,
            height + 0.04,
            64,
            1,
            true,
            thetaStart - 0.02,
            thetaLength + 0.04,
          ]}
        />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.3}
          metalness={0.1}
          side={THREE.BackSide}
          transparent
          opacity={0.96}
        />
      </mesh>

      {/* 2. Interactive Curved Display Screen with Live 21-Channel Waveforms */}
      {texture && (
        <mesh
          position={[0, 0, 0]}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onClick={handlePointerDown}
          onPointerOut={handlePointerOut}
        >
          <cylinderGeometry
            args={[
              radius,
              radius,
              height,
              64,
              1,
              true,
              thetaStart,
              thetaLength,
            ]}
          />
          <meshBasicMaterial
            map={texture}
            side={THREE.BackSide}
            toneMapped={false}
            transparent
            opacity={0.98}
          />
        </mesh>
      )}

      {/* 3. Subtle Glass Rim Outline */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry
          args={[
            radius - 0.005,
            radius - 0.005,
            height,
            64,
            1,
            true,
            thetaStart,
            thetaLength,
          ]}
        />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.05}
          transmission={0.9}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 4. High-Visibility 3D Laser Pointer Reticle (shows exact hit point on cylinder) */}
      <group ref={reticleGroupRef} visible={false}>
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[0.03, 0.042, 32]} />
          <meshBasicMaterial
            color="#0284c7"
            side={THREE.DoubleSide}
            transparent
            opacity={0.95}
            depthTest={false}
          />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.01, 16]} />
          <meshBasicMaterial
            color="#38bdf8"
            side={THREE.DoubleSide}
            transparent
            opacity={1.0}
            depthTest={false}
          />
        </mesh>
      </group>
    </group>
  );
};

export default XRCylinderWall;
