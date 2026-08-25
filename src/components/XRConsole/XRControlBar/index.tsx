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
const BASELINE_DURATION = 3;
const STIMULUS_DURATION = 60;
const TOTAL_DURATION = 63;

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

  const cardWidth = 0.78;
  const cardHeight = 0.31;
  const cardShape = useMemo(() => createPillShape(cardWidth, cardHeight, 0.035), []);

  const cardOutlineGeometry = useMemo(() => {
    const points = cardShape.getPoints(32);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [cardShape]);

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
  const phaseLabel = isBaseline ? "BASELINE PHASE" : "STIMULUS PHASE";
  const speedActiveVariant = isBaseline ? "active-baseline" : "active-stimulus";

  const focusStr = currentFocus !== null ? `${Math.round(currentFocus * 100)}%` : "--%";
  const avgStr = focusAvg !== undefined && focusAvg !== null ? `${Math.round(focusAvg * 100)}%` : "--%";

  // Dual-stage Progress Bar Calculations
  const baselineElapsed = isBaseline ? Math.min(BASELINE_DURATION, Math.max(0, trialElapsed)) : BASELINE_DURATION;
  const baselineFrac = Math.min(1, Math.max(0, baselineElapsed / BASELINE_DURATION));

  const stimulusElapsed = isBaseline ? 0 : Math.min(STIMULUS_DURATION, Math.max(0, trialElapsed - BASELINE_DURATION));
  const stimulusFrac = Math.min(1, Math.max(0, stimulusElapsed / STIMULUS_DURATION));

  const baselineBarWidth = 0.08;
  const stimulusBarWidth = 0.44;
  const barHeight = 0.008;

  return (
    <group position={[0, 0.82, -1.05]} rotation={[-Math.PI / 6, 0, 0]}>
      {/* 1. Frosted Translucent Backing Card for High Contrast */}
      <mesh position={[0, 0, -0.006]}>
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

      {/* Outermost Perimeter Contour Loop (no internal triangulation) */}
      <lineLoop geometry={cardOutlineGeometry} position={[0, 0, -0.004]}>
        <lineBasicMaterial color="#334155" transparent opacity={0.5} />
      </lineLoop>

      {/* 2. Top Header Row: Trial info, Phase pill, Exit button */}
      {/* Current Trial Readout */}
      <Text
        position={[-0.26, 0.115, 0.004]}
        fontSize={0.016}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
      >
        {`Trial ${currentTrial + 1} of ${TOTAL_TRIALS}`}
      </Text>

      {/* Phase Badge */}
      <group position={[0, 0.115, 0.004]}>
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
        position={[0.16, 0.115, 0.004]}
        fontSize={0.013}
        color="#94a3b8"
        anchorX="left"
        anchorY="middle"
      >
        {`${formatTime(trialElapsed)} / ${formatTime(TOTAL_DURATION)}`}
      </Text>

      {/* Exit XR Button */}
      <XRControlPill
        label="✕ Exit VR"
        onClick={() => onExitXR?.()}
        width={0.072}
        height={0.026}
        fontSize={0.01}
        variant="danger"
        position={[0.31, 0.115, 0.004]}
      />

      {/* 3. Dual-Stage Trial Progress Bar (Baseline [3s] + Stimulation [60s]) */}
      <group position={[0, 0.075, 0.004]}>
        {/* Baseline Track Container (Left) */}
        <group position={[-0.23, 0, 0]}>
          {/* Baseline Background Track */}
          <mesh position={[baselineBarWidth / 2, 0, 0]}>
            <planeGeometry args={[baselineBarWidth, barHeight]} />
            <meshBasicMaterial color="#1e1b4b" />
          </mesh>
          {/* Baseline Live Fill */}
          {baselineFrac > 0 && (
            <mesh position={[(baselineBarWidth * baselineFrac) / 2, 0, 0.001]}>
              <planeGeometry args={[baselineBarWidth * baselineFrac, barHeight]} />
              <meshBasicMaterial color="#6366f1" />
            </mesh>
          )}
          {/* Baseline Label */}
          <Text
            position={[baselineBarWidth / 2, -0.011, 0]}
            fontSize={0.0085}
            color={isBaseline ? "#a5b4fc" : "#6366f1"}
            anchorX="center"
            anchorY="middle"
          >
            Baseline (3s)
          </Text>
        </group>

        {/* Stimulation Track Container (Right) */}
        <group position={[-0.13, 0, 0]}>
          {/* Stimulus Background Track */}
          <mesh position={[stimulusBarWidth / 2, 0, 0]}>
            <planeGeometry args={[stimulusBarWidth, barHeight]} />
            <meshBasicMaterial color="#064e3b" />
          </mesh>
          {/* Stimulus Live Fill */}
          {stimulusFrac > 0 && (
            <mesh position={[(stimulusBarWidth * stimulusFrac) / 2, 0, 0.001]}>
              <planeGeometry args={[stimulusBarWidth * stimulusFrac, barHeight]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
          )}
          {/* Stimulus Label */}
          <Text
            position={[stimulusBarWidth / 2, -0.011, 0]}
            fontSize={0.0085}
            color={!isBaseline ? "#6ee7b7" : "#059669"}
            anchorX="center"
            anchorY="middle"
          >
            Stimulation Protocol (60s)
          </Text>
        </group>
      </group>

      {/* 4. Middle Telemetry Section: Focus Metrics + Auditory Stimuli Information */}
      <group position={[0, 0.015, 0.004]}>
        {/* Left Sub-card: Focus Index & Running Average */}
        <group position={[-0.18, 0, 0]}>
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[0.26, 0.046]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
          <Text
            position={[0, 0.011, 0.002]}
            fontSize={0.015}
            color={phaseColor}
            anchorX="center"
            anchorY="middle"
          >
            {`Focus ${focusStr}`}
          </Text>
          <Text
            position={[0, -0.011, 0.002]}
            fontSize={0.01}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            {`Running Avg: ${avgStr}`}
          </Text>
        </group>

        {/* Right Sub-card: Auditory Stimuli Information Section */}
        <group position={[0.14, 0, 0]}>
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[0.34, 0.046]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>

          {/* Section Header */}
          <Text
            position={[0, 0.013, 0.002]}
            fontSize={0.009}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            AUDITORY STIMULI INFORMATION
          </Text>

          {/* Valence & Arousal Telemetry */}
          {frame?.ratings ? (
            <Text
              position={[0, -0.009, 0.002]}
              fontSize={0.012}
              color="#38bdf8"
              anchorX="center"
              anchorY="middle"
            >
              {`Valence: ${frame.ratings.valence.toFixed(1)}  ·  Arousal: ${frame.ratings.arousal.toFixed(1)}  ·  Dominance: ${frame.ratings.dominance.toFixed(1)}`}
            </Text>
          ) : (
            <Text
              position={[0, -0.009, 0.002]}
              fontSize={0.01}
              color="#64748b"
              anchorX="center"
              anchorY="middle"
            >
              {isBaseline ? "Baseline Calibration · Neutral Audio" : "Synthesized Stimulus Protocol"}
            </Text>
          )}
        </group>
      </group>

      {/* 5. Bottom Flex Row of Playback Controls */}
      <group position={[0, -0.056, 0.004]}>
        {/* Prev Trial Button */}
        <XRControlPill
          label="◀ Prev"
          onClick={handlePrev}
          disabled={currentTrial <= 0}
          width={0.098}
          height={0.044}
          fontSize={0.013}
          variant={currentTrial > 0 ? "primary" : "neutral"}
          position={[-0.23, 0, 0]}
        />

        {/* Playback: Pause / Play Button */}
        <XRControlPill
          label={isPaused ? "▶ Play" : "⏸ Pause"}
          onClick={() => onTogglePlayPause?.()}
          width={0.108}
          height={0.044}
          fontSize={0.013}
          variant={isPaused ? speedActiveVariant : "primary"}
          position={[-0.102, 0, 0]}
        />

        {/* Playback: 1x Button */}
        <XRControlPill
          label="1x"
          onClick={() => onSetSpeed?.(1)}
          width={0.058}
          height={0.044}
          fontSize={0.013}
          variant={speed === 1 ? speedActiveVariant : "neutral"}
          position={[0.004, 0, 0]}
        />

        {/* Playback: 10x Button */}
        <XRControlPill
          label="10x"
          onClick={() => onSetSpeed?.(10)}
          width={0.058}
          height={0.044}
          fontSize={0.013}
          variant={speed === 10 ? speedActiveVariant : "neutral"}
          position={[0.084, 0, 0]}
        />

        {/* Next Trial Button */}
        <XRControlPill
          label="Next ▶"
          onClick={handleNext}
          disabled={currentTrial >= TOTAL_TRIALS - 1}
          width={0.098}
          height={0.044}
          fontSize={0.013}
          variant={currentTrial < TOTAL_TRIALS - 1 ? "primary" : "neutral"}
          position={[0.184, 0, 0]}
        />
      </group>

      {/* Selected Channel Hint */}
      {selectedChannel && (
        <Text
          position={[0, -0.108, 0.004]}
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
