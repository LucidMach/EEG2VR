import React, { useRef } from "react";
import * as THREE from "three";
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
  onChannelSelect?: (name: ElectrodeName) => void;
  radius?: number;
  height?: number;
}

export const XRCylinderWall: React.FC<XRCylinderWallProps> = ({
  frameRef,
  historiesRef,
  selectedChannel,
  onChannelSelect,
  radius = 3.6,
  height = 2.4,
}) => {
  const hitAreasRef = useRef<CylinderChannelHitArea[]>([]);
  const hoveredChannelRef = useRef<ElectrodeName | null>(null);

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
    if (!e.uv) return;

    const channel = getChannelAtUV(e.uv);
    if (channel !== hoveredChannelRef.current) {
      hoveredChannelRef.current = channel;
      if (channel) {
        triggerXRHaptic(e, 0.25, 10);
      }
    }
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (hoveredChannelRef.current !== null) {
      hoveredChannelRef.current = null;
    }
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!e.uv) return;

    const channel = getChannelAtUV(e.uv);
    if (channel) {
      triggerXRHaptic(e, 0.6, 25);
      onChannelSelect?.(channel);
    }
  };

  // Panoramic curved arc spanning ~160° around the user's field of view
  const thetaStart = Math.PI * 0.55;
  const thetaLength = Math.PI * 0.9;

  return (
    <group position={[0, 1.35, 0]}>
      {/* 1. Curved Backing Panel for Depth & Contrast */}
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
        <meshBasicMaterial
          color="#020408"
          side={THREE.BackSide}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* 2. Interactive Curved Display Screen with Live 21-Channel Waveforms */}
      {texture && (
        <mesh
          position={[0, 0, 0]}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
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
            opacity={0.96}
          />
        </mesh>
      )}

      {/* 3. Subtle Holographic Glass Rim */}
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
          color="#38bdf8"
          roughness={0.1}
          metalness={0.2}
          transmission={0.96}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default XRCylinderWall;
