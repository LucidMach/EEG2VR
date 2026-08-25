import React, { useMemo } from "react";
import * as THREE from "three";
import { createPillShape } from "../pillShape";
import XRControlPill from "../XRControlBar/XRControlPill";
import TextLink from "./TextLink";

interface IdleActionsXRProps {
  onStartDemo?: () => void;
  onStartLive?: () => void;
  onExitXR?: () => void;
}

const CARD_WIDTH = 0.42;
const CARD_HEIGHT = 0.2;

export const IdleActionsXR: React.FC<IdleActionsXRProps> = ({
  onStartDemo,
  onStartLive,
  onExitXR,
}) => {
  const cardShape = useMemo(() => createPillShape(CARD_WIDTH, CARD_HEIGHT, 0.04), []);
  const cardOutlineGeo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(cardShape.getPoints(48)),
    [cardShape]
  );

  return (
    <group position={[0, 0.71, -1.2]} rotation={[-Math.PI / 12, 0, 0]}>
      {/* Frosted backing card, matching XRControlBar / XRAudioErrorAlert so
          the first surface a VR user sees reads as clearly as every other
          console panel. */}
      <mesh position={[0, -0.005, -0.006]}>
        <shapeGeometry args={[cardShape]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.25}
          metalness={0.2}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineLoop geometry={cardOutlineGeo} position={[0, -0.005, -0.004]}>
        <lineBasicMaterial color="#334155" transparent opacity={0.6} />
      </lineLoop>

      {/* 1. Primary "Run Demo Mode" Pill Button */}
      <XRControlPill
        label="Run Demo Mode"
        onClick={() => onStartDemo?.()}
        width={0.34}
        height={0.062}
        fontSize={0.015}
        variant="primary"
        position={[0, 0.04, 0.002]}
      />

      {/* 2. Secondary "Connect your EEG headset" Text Link */}
      <TextLink
        label="Connect your EEG headset"
        onClick={() => onStartLive?.()}
        position={[0, -0.025, 0.002]}
        fontSize={0.012}
        idleColor="#94a3b8"
        hoverColor="#e2e8f0"
      />

      {/* 3. Exit XR Mode Link */}
      <TextLink
        label="✕ Exit XR Mode"
        onClick={() => onExitXR?.()}
        position={[0, -0.065, 0.002]}
        fontSize={0.011}
        idleColor="#64748b"
        hoverColor="#f87171"
      />
    </group>
  );
};

export default IdleActionsXR;
