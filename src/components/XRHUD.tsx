import * as THREE from "three";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { ELECTRODE_NAMES, ELECTRODE_METADATA, type ElectrodeName, type Frame } from "../utils/signalSource";
import type { HistorySample } from "../hooks/usePlaybackEngine";
import type { AppMode } from "../utils/appMode";

interface XRHUDProps {
  frameRef: React.RefObject<Frame>;
  historiesRef: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  selectedChannel: ElectrodeName | null;
  onChannelSelect: (name: ElectrodeName) => void;
  mode: AppMode;
  isPaused: boolean;
  speed: number;
  togglePlayPause: () => void;
  setSpeed: (speed: number) => void;
  disconnect: () => void;
  selectTrial: (index: number, startOffset?: number) => void;
  startDemo: () => void;
  startLive: () => void;
}

// Modern, high-trust color palette mapped to head regions
const REGION_RGBA: Record<string, { r: number; g: number; b: number }> = {
  Frontal: { r: 99, g: 102, b: 241 },   // Indigo
  Temporal: { r: 168, g: 85, b: 247 },  // Purple
  Central: { r: 59, g: 130, b: 246 },   // Blue
  Parietal: { r: 6, g: 182, b: 212 },   // Cyan
  Occipital: { r: 16, g: 185, b: 129 }, // Emerald
};

const HISTORY_LIMIT = 60;

// Reusable 3D button component for WebXR
const InteractiveButton: React.FC<{
  position: [number, number, number];
  width: number;
  height: number;
  text: string;
  onClick: () => void;
  isActive?: boolean;
}> = ({ position, width, height, text, onClick, isActive = false }) => {
  const [hovered, setHovered] = useState(false);

  const borderCol = isActive ? "#818cf8" : "#475569";
  const baseColor = isActive ? "#4f46e5" : "#1e293b";
  const buttonColor = hovered ? "#312e81" : baseColor;

  return (
    <group position={position}>
      {/* Border Outline Plate */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[width + 0.003, height + 0.003]} />
        <meshBasicMaterial color={hovered ? "#818cf8" : borderCol} />
      </mesh>

      {/* Interactive Main Plate */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={buttonColor}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Button Label */}
      <Text
        position={[0, 0, 0.002]}
        fontSize={height * 0.35}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </group>
  );
};

// Reusable Timeline dot representing individual trials
const TimelineDot: React.FC<{
  position: [number, number, number];
  index: number;
  isActive: boolean;
  isPast: boolean;
  phase: Frame["phase"];
  onClick: () => void;
}> = ({ position, index, isActive, isPast, phase, onClick }) => {
  const [hovered, setHovered] = useState(false);

  const activeColor = phase === "baseline" ? "#6366f1" : "#10b981";
  const dotColor = isActive
    ? activeColor
    : isPast
      ? activeColor
      : "#475569";

  const dotSize = isActive ? 0.009 : hovered ? 0.007 : 0.004;

  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <sphereGeometry args={[dotSize, 12, 12]} />
      <meshBasicMaterial color={hovered ? "#38bdf8" : dotColor} />
    </mesh>
  );
};

// Real-Time scrolling wave oscilloscopes mapped to 3D canvas texture
const XROscilloscopes: React.FC<{
  historiesRef: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  frameRef: React.RefObject<Frame>;
  selectedChannel: ElectrodeName | null;
}> = ({ historiesRef, frameRef, selectedChannel }) => {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    return c;
  }, []);

  const ctx = useMemo(() => canvas.getContext("2d")!, [canvas]);

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [canvas]);

  let lastFrame: Frame | null = null;

  useFrame(() => {
    if (frameRef.current !== lastFrame) {
      lastFrame = frameRef.current;
      drawOscilloscopes(ctx, canvas, historiesRef.current || {}, selectedChannel);
      texture.needsUpdate = true;
    }
  });

  return (
    <mesh castShadow receiveShadow>
      <planeGeometry args={[0.48, 0.48]} />
      <meshBasicMaterial map={texture} transparent opacity={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
};

function drawOscilloscopes(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  histories: Record<ElectrodeName, HistorySample[]>,
  selectedChannel: ElectrodeName | null
) {
  const width = canvas.width;
  const height = canvas.height;

  // Render dark background
  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.fillRect(0, 0, width, height);

  // Border outline
  ctx.strokeStyle = "rgba(79, 70, 229, 0.4)";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, width, height);

  const numElectrodes = ELECTRODE_NAMES.length;
  const paddingTop = 20;
  const paddingBottom = 20;
  const usableHeight = height - paddingTop - paddingBottom;
  const laneHeight = usableHeight / numElectrodes;

  const paddingLeft = 40;
  const drawWidth = width - paddingLeft - 10;

  const means: Record<string, number> = {};
  let maxDeviation = 1.0;

  ELECTRODE_NAMES.forEach((name) => {
    const chanHistory = histories[name] || [];
    if (chanHistory.length > 0) {
      const sum = chanHistory.reduce((a, b) => a + b.value, 0);
      const mean = sum / chanHistory.length;
      means[name] = mean;

      chanHistory.forEach((sample) => {
        const dev = Math.abs(sample.value - mean);
        if (dev > maxDeviation) {
          maxDeviation = dev;
        }
      });
    } else {
      means[name] = 0;
    }
  });

  ELECTRODE_NAMES.forEach((name, idx) => {
    const meta = ELECTRODE_METADATA[name];
    const chanHistory = histories[name] || [];
    const isSelected = name === selectedChannel;

    const centerY = paddingTop + (idx + 0.5) * laneHeight;

    // Draw baseline
    ctx.beginPath();
    ctx.strokeStyle = isSelected ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.moveTo(paddingLeft, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw labels
    ctx.fillStyle = isSelected ? "rgba(129, 140, 248, 1.0)" : "rgba(148, 163, 184, 0.6)";
    ctx.font = isSelected ? "bold 10px monospace" : "8px monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(name, paddingLeft - 6, centerY);

    // Draw waves
    if (chanHistory.length > 1) {
      ctx.beginPath();
      const color = REGION_RGBA[meta.region] || { r: 100, g: 116, b: 139 };
      const opacity = isSelected ? 1.0 : 0.4;
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
      ctx.lineWidth = isSelected ? 2.5 : 1.0;

      const numSamples = chanHistory.length;
      const step = drawWidth / (HISTORY_LIMIT - 1);

      for (let i = 0; i < numSamples; i++) {
        const sample = chanHistory[i];
        const val = sample.value;
        const mean = means[name] ?? 0;
        const centeredVal = val - mean;
        const yOffset = (centeredVal / maxDeviation) * (laneHeight * 0.8 / 2);
        const x = paddingLeft + i * step;
        const y = centerY - yOffset;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevSample = chanHistory[i - 1];
          if (prevSample.isBaseline !== sample.isBaseline) {
            if (prevSample.isBaseline) {
              ctx.setLineDash([2, 3]);
            } else {
              ctx.setLineDash([]);
            }
            ctx.lineTo(x, y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      }

      const lastSample = chanHistory[numSamples - 1];
      if (lastSample.isBaseline) {
        ctx.setLineDash([2, 3]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
}

// Snapshot interface for local state checks to reduce React re-renders in useFrame
interface HUDSnapshot {
  phase: Frame["phase"];
  trialIndex: number;
  trialElapsed: number;
  valence?: number;
  arousal?: number;
  focus?: number;
  focusAvg: number;
  currentValue: number;
}

const INITIAL_SNAPSHOT: HUDSnapshot = {
  phase: "idle",
  trialIndex: 0,
  trialElapsed: 0,
  focusAvg: 0,
  currentValue: 0,
};

const XRHUD: React.FC<XRHUDProps> = ({
  frameRef,
  historiesRef,
  selectedChannel,
  onChannelSelect,
  mode,
  isPaused,
  speed,
  togglePlayPause,
  setSpeed,
  disconnect,
  selectTrial,
  startDemo,
  startLive,
}) => {
  const { gl } = useThree();
  const hudRef = useRef<THREE.Group>(null);
  const [snapshot, setSnapshot] = useState<HUDSnapshot>(INITIAL_SNAPSHOT);
  const sigRef = useRef<string>("");

  // Smooth elastic gaze-following hook in useFrame
  useFrame((state) => {
    if (!state.gl.xr.isPresenting) return;

    // Follow the camera/gaze smoothly
    if (hudRef.current) {
      const cam = state.camera;
      
      // Floating 1.2 meters away from user, slightly below eye line
      const targetPos = new THREE.Vector3(0, -0.15, -1.2);
      targetPos.applyQuaternion(cam.quaternion);
      targetPos.add(cam.position);

      hudRef.current.position.lerp(targetPos, 0.08); // smooth elastic interpolation
      hudRef.current.quaternion.slerp(cam.quaternion, 0.08);
    }

    // Capture playback details into local state to keep subcomponents responsive
    const frame = frameRef.current;
    const val = selectedChannel && frame.channels[selectedChannel]
      ? frame.channels[selectedChannel]!.value
      : 0;

    const next: HUDSnapshot = {
      phase: frame.phase,
      trialIndex: frame.trialIndex ?? 0,
      trialElapsed: frame.trialElapsed ?? 0,
      valence: frame.ratings?.valence,
      arousal: frame.ratings?.arousal,
      focus: frame.focus,
      focusAvg: frame.focus_avg ?? 0,
      currentValue: val,
    };

    // Calculate state signature for shallow comparisons
    const sig = `${next.phase}|${next.trialIndex}|${Math.floor(next.trialElapsed)}|${next.valence}|${next.arousal}|${
      next.focus === undefined ? "-" : Math.round(next.focus * 100)
    }|${Math.round(next.focusAvg * 100)}|${val.toFixed(2)}|${selectedChannel ?? "-"}`;

    if (sig !== sigRef.current) {
      sigRef.current = sig;
      setSnapshot(next);
    }
  });

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isIdle = mode.kind === "idle";

  if (!gl.xr.isPresenting) return null;

  return (
    <group ref={hudRef}>
      {isIdle ? (
        /* Welcome / Idle Workspace Menu */
        <group position={[0, 0.1, 0]}>
          <mesh castShadow receiveShadow>
            <planeGeometry args={[0.6, 0.3]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.1} transparent opacity={0.85} />
          </mesh>

          {/* Border */}
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[0.604, 0.304]} />
            <meshBasicMaterial color="#4f46e5" />
          </mesh>

          <Text
            position={[0, 0.09, 0.002]}
            fontSize={0.038}
            color="#818cf8"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
          >
            EEG2VR
          </Text>

          <Text
            position={[0, 0.05, 0.002]}
            fontSize={0.015}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            Virtual Reality EEG Twin Workspace
          </Text>

          <InteractiveButton
            position={[0, -0.02, 0.002]}
            width={0.24}
            height={0.045}
            text="Start Demo Mode"
            onClick={startDemo}
          />

          <InteractiveButton
            position={[0, -0.08, 0.002]}
            width={0.24}
            height={0.045}
            text="Start Live Connection"
            onClick={startLive}
          />
        </group>
      ) : (
        /* Active Playback HUD Panels */
        <>
          {/* 1. PLAYBACK CONTROLLER PANEL (Bottom Center) */}
          <group position={[0, -0.32, 0]}>
            <mesh castShadow receiveShadow>
              <planeGeometry args={[0.6, 0.14]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.1} transparent opacity={0.85} />
            </mesh>
            
            {/* Border */}
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[0.604, 0.144]} />
              <meshBasicMaterial color="#4f46e5" />
            </mesh>

            {/* Top Text Readouts */}
            <Text
              position={[-0.22, 0.04, 0.002]}
              fontSize={0.012}
              color="#94a3b8"
              anchorX="left"
              anchorY="middle"
            >
              {`Trial ${snapshot.trialIndex + 1} of 40 (${snapshot.phase.toUpperCase()})`}
            </Text>

            <Text
              position={[0.22, 0.04, 0.002]}
              fontSize={0.012}
              color="#94a3b8"
              anchorX="right"
              anchorY="middle"
            >
              {`${formatTime(snapshot.trialElapsed)} / 1:03`}
            </Text>

            {/* Playback Action Buttons */}
            <InteractiveButton
              position={[-0.21, -0.005, 0.002]}
              width={0.08}
              height={0.03}
              text="Exit"
              onClick={disconnect}
            />

            <InteractiveButton
              position={[-0.1, -0.005, 0.002]}
              width={0.11}
              height={0.03}
              text={isPaused ? "Play" : "Pause"}
              onClick={togglePlayPause}
            />

            <InteractiveButton
              position={[0.06, -0.005, 0.002]}
              width={0.06}
              height={0.03}
              text="1x"
              onClick={() => setSpeed(1)}
              isActive={speed === 1}
            />

            <InteractiveButton
              position={[0.13, -0.005, 0.002]}
              width={0.06}
              height={0.03}
              text="10x"
              onClick={() => setSpeed(10)}
              isActive={speed === 10}
            />

            {/* 3D Timeline Slider Track */}
            <mesh position={[0, -0.045, -0.001]}>
              <planeGeometry args={[0.44, 0.002]} />
              <meshBasicMaterial color="#334155" />
            </mesh>

            {/* Timeline Dot Selection */}
            {Array.from({ length: 40 }).map((_, i) => {
              const isActive = i === snapshot.trialIndex;
              const isPast = i < snapshot.trialIndex;
              const xPos = -0.22 + (i / 39) * 0.44;

              return (
                <TimelineDot
                  key={i}
                  position={[xPos, -0.045, 0.002]}
                  index={i}
                  isActive={isActive}
                  isPast={isPast}
                  phase={snapshot.phase}
                  onClick={() => selectTrial(i, snapshot.phase === "baseline" ? 0 : 3)}
                />
              );
            })}
          </group>

          {/* 2. STATS & RATINGS PANEL (Right Side) */}
          <group position={[0.55, 0.0, -0.1]} rotation={[0, -Math.PI / 6, 0]}>
            <mesh castShadow receiveShadow>
              <planeGeometry args={[0.45, 0.48]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.1} transparent opacity={0.85} />
            </mesh>
            
            {/* Border */}
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[0.454, 0.484]} />
              <meshBasicMaterial color="#4f46e5" />
            </mesh>

            <Text
              position={[0, 0.19, 0.002]}
              fontSize={0.02}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
            >
              EEG DIGITAL TWIN
            </Text>

            <Text
              position={[0, 0.13, 0.002]}
              fontSize={0.014}
              color="#818cf8"
              anchorX="center"
              anchorY="middle"
            >
              {snapshot.phase === "quality-check"
                ? "Monitoring Quality Check"
                : `Trial ${snapshot.trialIndex + 1} · ${snapshot.phase === "baseline" ? "Baseline Phase" : "Stimulus Phase"}`}
            </Text>

            {snapshot.phase === "stimulus" && snapshot.valence !== undefined && snapshot.arousal !== undefined && (
              <Text
                position={[0, 0.07, 0.002]}
                fontSize={0.013}
                color="#cbd5e1"
                anchorX="center"
                anchorY="middle"
              >
                {`Valence: ${snapshot.valence.toFixed(1)}  Arousal: ${snapshot.arousal.toFixed(1)}`}
              </Text>
            )}

            {snapshot.phase === "stimulus" && snapshot.focus !== undefined && (
              <Text
                position={[0, 0.02, 0.002]}
                fontSize={0.013}
                color="#10b981"
                anchorX="center"
                anchorY="middle"
              >
                {`Focus: ${Math.round(snapshot.focus * 100)}%  [Avg: ${Math.round(snapshot.focusAvg * 100)}%]`}
              </Text>
            )}

            {/* Active Electrode details panel */}
            <group position={[0, -0.09, 0.002]}>
              <mesh>
                <planeGeometry args={[0.38, 0.09]} />
                <meshStandardMaterial color="#1e293b" roughness={0.15} metalness={0.1} />
              </mesh>
              
              {/* Border for sub-box */}
              <mesh position={[0, 0, -0.001]}>
                <planeGeometry args={[0.382, 0.092]} />
                <meshBasicMaterial color="#334155" />
              </mesh>

              <Text
                position={[0, 0.02, 0.002]}
                fontSize={0.014}
                color="#f1f5f9"
                anchorX="center"
                anchorY="middle"
              >
                {selectedChannel
                  ? `Electrode: ${selectedChannel}`
                  : "Point LED to Inspect"}
              </Text>

              <Text
                position={[0, -0.015, 0.002]}
                fontSize={0.012}
                color="#94a3b8"
                anchorX="center"
                anchorY="middle"
              >
                {selectedChannel
                  ? `Value: ${snapshot.currentValue.toFixed(2)} µV`
                  : "No Channel Selected"}
              </Text>
            </group>

            <Text
              position={[0, -0.19, 0.002]}
              fontSize={0.01}
              color="#64748b"
              anchorX="center"
              anchorY="middle"
            >
              Aim controller & click electrodes to select
            </Text>
          </group>

          {/* 3. SCROLLING OSCILLOSCOPES PANEL (Left Side) */}
          <group position={[-0.55, 0.0, -0.1]} rotation={[0, Math.PI / 6, 0]}>
            <XROscilloscopes
              historiesRef={historiesRef}
              frameRef={frameRef}
              selectedChannel={selectedChannel}
            />
          </group>
        </>
      )}
    </group>
  );
};

export default XRHUD;
