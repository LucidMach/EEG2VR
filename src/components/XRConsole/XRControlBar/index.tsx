import React from "react";
import { Text } from "@react-three/drei";
import type { Frame, ElectrodeName } from "../../../utils/signalSource";
import { formatTime } from "../../TrialProgressBar/formatTime";
import XRControlPill from "./XRControlPill";

interface XRControlBarProps {
  frameRef: React.RefObject<Frame>;
  selectedChannel: ElectrodeName | null;
  speed?: number;
  isPaused?: boolean;
  onTrialSelect?: (index: number, startOffset?: number) => void;
  onTogglePlayPause?: () => void;
  onSetSpeed?: (speed: number) => void;
  onExitXR?: () => void;
}

const TOTAL_TRIALS = 40;
const TRIAL_DURATION = 63;

export const XRControlBar: React.FC<XRControlBarProps> = ({
  frameRef,
  selectedChannel,
  speed = 1,
  isPaused = false,
  onTrialSelect,
  onTogglePlayPause,
  onSetSpeed,
  onExitXR,
}) => {
  const frame = frameRef.current;
  const currentTrial = frame?.trialIndex ?? 0;
  const trialElapsed = frame?.trialElapsed ?? 0;
  const isBaseline = frame?.phase === "baseline";
  const phase = frame?.phase ?? "idle";

  const handlePrev = () => {
    if (currentTrial > 0) {
      onTrialSelect?.(currentTrial - 1);
    }
  };

  const handleNext = () => {
    if (currentTrial < TOTAL_TRIALS - 1) {
      onTrialSelect?.(currentTrial + 1);
    }
  };

  const phaseColor = isBaseline ? "#818cf8" : "#34d399";
  const phaseLabel = isBaseline ? "BASELINE" : "STIMULUS";
  const speedActiveVariant = isBaseline ? "active-baseline" : "active-stimulus";

  return (
    <group position={[0, 0.84, -1.05]} rotation={[-Math.PI / 6, 0, 0]}>
      {/* 1. Base Glass Pod Chassis matching web dark slate capsule */}
      <mesh position={[0, 0, -0.008]}>
        <boxGeometry args={[0.72, 0.21, 0.015]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.2}
          metalness={0.4}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Subtle Rim Edge */}
      <mesh position={[0, 0, 0.001]}>
        <boxGeometry args={[0.724, 0.214, 0.002]} />
        <meshPhysicalMaterial
          color="#334155"
          roughness={0.1}
          metalness={0.2}
          transmission={0.9}
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Top Status Row matching web TopHudBar & TrialProgressBar */}
      {/* Current Trial Readout */}
      <Text
        position={[-0.25, 0.058, 0.008]}
        fontSize={0.017}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
      >
        {`Trial ${currentTrial + 1} of ${TOTAL_TRIALS}`}
      </Text>

      {/* Phase Badge */}
      <group position={[0, 0.058, 0.008]}>
        <Text
          fontSize={0.013}
          color={phaseColor}
          anchorX="center"
          anchorY="middle"
        >
          {`● ${phaseLabel}`}
        </Text>
      </group>

      {/* Elapsed Time Counter */}
      <Text
        position={[0.16, 0.058, 0.008]}
        fontSize={0.013}
        color="#94a3b8"
        anchorX="left"
        anchorY="middle"
      >
        {`${formatTime(trialElapsed)} / ${formatTime(TRIAL_DURATION)}`}
      </Text>

      {/* Exit XR Button */}
      <XRControlPill
        label="✕ Exit VR"
        onClick={() => onExitXR?.()}
        width={0.075}
        height={0.03}
        fontSize={0.01}
        variant="danger"
        position={[0.3, 0.058, 0.008]}
      />

      {/* Divider Line matching web slate-800 */}
      <mesh position={[0, 0.022, 0.008]}>
        <planeGeometry args={[0.66, 0.001]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>

      {/* 3. Bottom Flex Row of Controls matching web PlaybackControls */}
      <group position={[0, -0.04, 0.008]}>
        {/* 2.a Prev Trial Button */}
        <XRControlPill
          label="◀ Prev"
          onClick={handlePrev}
          disabled={currentTrial <= 0}
          width={0.1}
          height={0.046}
          fontSize={0.014}
          variant={currentTrial > 0 ? "primary" : "neutral"}
          position={[-0.23, 0, 0]}
        />

        {/* 2.b Playback: Pause / Play Button */}
        <XRControlPill
          label={isPaused ? "▶ Play" : "⏸ Pause"}
          onClick={() => onTogglePlayPause?.()}
          width={0.11}
          height={0.046}
          fontSize={0.014}
          variant={isPaused ? speedActiveVariant : "primary"}
          position={[-0.1, 0, 0]}
        />

        {/* 2.b Playback: 1x Button */}
        <XRControlPill
          label="1x"
          onClick={() => onSetSpeed?.(1)}
          width={0.06}
          height={0.046}
          fontSize={0.014}
          variant={speed === 1 ? speedActiveVariant : "neutral"}
          position={[0.005, 0, 0]}
        />

        {/* 2.b Playback: 10x Button */}
        <XRControlPill
          label="10x"
          onClick={() => onSetSpeed?.(10)}
          width={0.06}
          height={0.046}
          fontSize={0.014}
          variant={speed === 10 ? speedActiveVariant : "neutral"}
          position={[0.085, 0, 0]}
        />

        {/* 2.c Next Trial Button */}
        <XRControlPill
          label="Next ▶"
          onClick={handleNext}
          disabled={currentTrial >= TOTAL_TRIALS - 1}
          width={0.1}
          height={0.046}
          fontSize={0.014}
          variant={currentTrial < TOTAL_TRIALS - 1 ? "primary" : "neutral"}
          position={[0.185, 0, 0]}
        />
      </group>

      {/* Selected Channel Hint */}
      {selectedChannel && (
        <Text
          position={[0, -0.084, 0.008]}
          fontSize={0.01}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          {`Selected: ${selectedChannel}  ·  Point ray at sensor LED or cylinder lane to inspect`}
        </Text>
      )}
    </group>
  );
};

export default XRControlBar;
