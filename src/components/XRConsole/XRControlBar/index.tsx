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

  const phaseColor =
    phase === "stimulus" ? "#34d399" : phase === "baseline" ? "#818cf8" : "#fbbf24";
  const phaseText =
    phase === "stimulus"
      ? "STIMULUS PHASE"
      : phase === "baseline"
      ? "BASELINE PHASE"
      : "QUALITY CHECK";

  return (
    <group position={[0, 0.82, -1.05]} rotation={[-Math.PI / 6, 0, 0]}>
      {/* 1. Base Glass Pod Chassis */}
      <mesh position={[0, 0, -0.008]}>
        <boxGeometry args={[0.74, 0.22, 0.015]} />
        <meshStandardMaterial
          color="#0b1120"
          roughness={0.2}
          metalness={0.4}
          transparent
          opacity={0.94}
        />
      </mesh>

      {/* Rim Bezel */}
      <mesh position={[0, 0, 0.001]}>
        <boxGeometry args={[0.744, 0.224, 0.002]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          roughness={0.1}
          metalness={0.2}
          transmission={0.9}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Top Status Row */}
      {/* 2.a Current Trial Readout */}
      <Text
        position={[-0.26, 0.062, 0.008]}
        fontSize={0.018}
        color="#38bdf8"
        anchorX="left"
        anchorY="middle"
      >
        {`TRIAL ${currentTrial + 1} OF ${TOTAL_TRIALS}`}
      </Text>

      {/* 2.b Phase Pill Indicator */}
      <group position={[0, 0.062, 0.008]}>
        <Text
          fontSize={0.013}
          color={phaseColor}
          anchorX="center"
          anchorY="middle"
        >
          {`● ${phaseText}`}
        </Text>
      </group>

      {/* 2.c Elapsed Time Counter */}
      <Text
        position={[0.16, 0.062, 0.008]}
        fontSize={0.013}
        color="#94a3b8"
        anchorX="left"
        anchorY="middle"
      >
        {`${formatTime(trialElapsed)} / ${formatTime(TRIAL_DURATION)}`}
      </Text>

      {/* 2.d Exit XR Button */}
      <XRControlPill
        label="✕ EXIT"
        onClick={() => onExitXR?.()}
        width={0.075}
        height={0.032}
        fontSize={0.011}
        variant="danger"
        position={[0.31, 0.062, 0.008]}
      />

      {/* Divider Line */}
      <mesh position={[0, 0.024, 0.008]}>
        <planeGeometry args={[0.68, 0.0015]} />
        <meshBasicMaterial color="#334155" transparent opacity={0.6} />
      </mesh>

      {/* 3. Bottom Flex Row of Controls */}
      <group position={[0, -0.042, 0.008]}>
        {/* 2.a Prev Trial Button */}
        <XRControlPill
          label="◀ PREV"
          onClick={handlePrev}
          disabled={currentTrial <= 0}
          width={0.11}
          height={0.046}
          fontSize={0.014}
          variant={currentTrial > 0 ? "primary" : "neutral"}
          position={[-0.24, 0, 0]}
        />

        {/* 2.b Playback: Pause / Play Button */}
        <XRControlPill
          label={isPaused ? "▶ PLAY" : "⏸ PAUSE"}
          onClick={() => onTogglePlayPause?.()}
          width={0.11}
          height={0.046}
          fontSize={0.014}
          variant={isPaused ? "active" : "secondary"}
          position={[-0.105, 0, 0]}
        />

        {/* 2.b Playback: 1x Button */}
        <XRControlPill
          label="1X"
          onClick={() => onSetSpeed?.(1)}
          width={0.065}
          height={0.046}
          fontSize={0.014}
          variant={speed === 1 ? "active" : "neutral"}
          position={[0.005, 0, 0]}
        />

        {/* 2.b Playback: 10x Button */}
        <XRControlPill
          label="10X"
          onClick={() => onSetSpeed?.(10)}
          width={0.065}
          height={0.046}
          fontSize={0.014}
          variant={speed === 10 ? "active" : "neutral"}
          position={[0.095, 0, 0]}
        />

        {/* 2.c Next Trial Button */}
        <XRControlPill
          label="NEXT ▶"
          onClick={handleNext}
          disabled={currentTrial >= TOTAL_TRIALS - 1}
          width={0.11}
          height={0.046}
          fontSize={0.014}
          variant={currentTrial < TOTAL_TRIALS - 1 ? "primary" : "neutral"}
          position={[0.205, 0, 0]}
        />
      </group>

      {/* Selected Channel Hint */}
      {selectedChannel && (
        <Text
          position={[0, -0.088, 0.008]}
          fontSize={0.011}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          {`Selected Electrode: ${selectedChannel}  ·  Click sensor LED or cylinder lane to change`}
        </Text>
      )}
    </group>
  );
};

export default XRControlBar;
