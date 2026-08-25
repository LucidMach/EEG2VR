import React, { useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { Frame, ElectrodeName } from "../../../utils/signalSource";
import { formatTime } from "../../TrialProgressBar/formatTime";
import { createPillShape } from "../pillShape";
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
  const currentFocus = frame?.focus !== undefined && frame?.focus !== null ? frame.focus : null;
  const focusAvg = frame?.focus_avg;

  const cardShape = useMemo(() => createPillShape(0.72, 0.22, 0.04), []);

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

  const focusStr = currentFocus !== null ? `${Math.round(currentFocus * 100)}%` : "--%";
  const avgStr = focusAvg !== undefined && focusAvg !== null ? `${Math.round(focusAvg * 100)}%` : "--%";

  return (
    <group position={[0, 0.84, -1.05]} rotation={[-Math.PI / 6, 0, 0]}>
      {/* 1. Frosted Translucent Backing Card for High Contrast */}
      <mesh position={[0, 0, -0.006]}>
        <shapeGeometry args={[cardShape]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.25}
          metalness={0.2}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Subtle Frosted Glass Rim */}
      <mesh position={[0, 0, -0.005]}>
        <shapeGeometry args={[cardShape]} />
        <meshBasicMaterial
          color="#334155"
          wireframe
          wireframeLinewidth={1}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* 2. Top Status Row */}
      {/* Current Trial Readout */}
      <Text
        position={[-0.24, 0.068, 0.004]}
        fontSize={0.016}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
      >
        {`Trial ${currentTrial + 1} of ${TOTAL_TRIALS}`}
      </Text>

      {/* Phase Badge */}
      <group position={[0, 0.068, 0.004]}>
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
        position={[0.13, 0.068, 0.004]}
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
        height={0.028}
        fontSize={0.01}
        variant="danger"
        position={[0.28, 0.068, 0.004]}
      />

      {/* Divider Line */}
      <mesh position={[0, 0.046, 0.002]}>
        <planeGeometry args={[0.64, 0.001]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0.6} />
      </mesh>

      {/* 3. Focus Metrics in space above the pause / playback buttons */}
      <group position={[0, 0.022, 0.004]}>
        {/* Main Focus Metric & Running Average */}
        <Text
          position={frame?.ratings ? [-0.08, 0, 0] : [0, 0, 0]}
          fontSize={0.018}
          color={phaseColor}
          anchorX="center"
          anchorY="middle"
        >
          {`Focus ${focusStr}  ·  [Avg: ${avgStr}]`}
        </Text>

        {/* Valence / Arousal telemetry chip (if ratings present during stimulus) */}
        {frame?.ratings && (
          <Text
            position={[0.16, 0, 0]}
            fontSize={0.012}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
          >
            {`Valence ${frame.ratings.valence.toFixed(1)}  Arousal ${frame.ratings.arousal.toFixed(1)}`}
          </Text>
        )}
      </group>

      {/* 4. Flex Row of Playback Controls */}
      <group position={[0, -0.038, 0.004]}>
        {/* Prev Trial Button */}
        <XRControlPill
          label="◀ Prev"
          onClick={handlePrev}
          disabled={currentTrial <= 0}
          width={0.095}
          height={0.044}
          fontSize={0.013}
          variant={currentTrial > 0 ? "primary" : "neutral"}
          position={[-0.22, 0, 0]}
        />

        {/* Playback: Pause / Play Button */}
        <XRControlPill
          label={isPaused ? "▶ Play" : "⏸ Pause"}
          onClick={() => onTogglePlayPause?.()}
          width={0.105}
          height={0.044}
          fontSize={0.013}
          variant={isPaused ? speedActiveVariant : "primary"}
          position={[-0.095, 0, 0]}
        />

        {/* Playback: 1x Button */}
        <XRControlPill
          label="1x"
          onClick={() => onSetSpeed?.(1)}
          width={0.058}
          height={0.044}
          fontSize={0.013}
          variant={speed === 1 ? speedActiveVariant : "neutral"}
          position={[0.008, 0, 0]}
        />

        {/* Playback: 10x Button */}
        <XRControlPill
          label="10x"
          onClick={() => onSetSpeed?.(10)}
          width={0.058}
          height={0.044}
          fontSize={0.013}
          variant={speed === 10 ? speedActiveVariant : "neutral"}
          position={[0.085, 0, 0]}
        />

        {/* Next Trial Button */}
        <XRControlPill
          label="Next ▶"
          onClick={handleNext}
          disabled={currentTrial >= TOTAL_TRIALS - 1}
          width={0.095}
          height={0.044}
          fontSize={0.013}
          variant={currentTrial < TOTAL_TRIALS - 1 ? "primary" : "neutral"}
          position={[0.18, 0, 0]}
        />
      </group>

      {/* Selected Channel Hint */}
      {selectedChannel && (
        <Text
          position={[0, -0.084, 0.004]}
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
