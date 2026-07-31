import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { ElectrodeName, Frame } from "../utils/signalSource";
import type { AppMode } from "../utils/appMode";

interface XRConsoleProps {
  frameRef: React.RefObject<Frame>;
  selectedChannel: ElectrodeName | null;
  mode: AppMode;
  isPaused: boolean;
  speed: number;
  togglePlayPause: () => void;
  setSpeed: (speed: number) => void;
  startDemo: () => void;
  startLive: () => void;
  disconnect: () => void;
  selectTrial: (index: number) => void;
}

interface ConsoleSnapshot {
  inVR: boolean;
  phase: Frame["phase"];
  trialIndex: number;
  valence?: number;
  arousal?: number;
  focus?: number;
  focusAvg: number;
  currentValue: number;
}

const EMPTY_SNAPSHOT: ConsoleSnapshot = {
  inVR: false,
  phase: "idle",
  trialIndex: 0,
  focusAvg: 0,
  currentValue: 0,
};

interface XRButtonProps {
  position: [number, number, number];
  args: [number, number, number]; // width, height, depth
  label: string;
  onClick: () => void;
  color?: string;
  hoverColor?: string;
  labelColor?: string;
  fontSize?: number;
}

const XRButton: React.FC<XRButtonProps> = ({
  position,
  args,
  label,
  onClick,
  color = "#1e293b",
  hoverColor = "#312e81",
  labelColor = "#ffffff",
  fontSize = 0.011,
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Press feedback (moves back slightly along the Z-axis)
  const buttonZOffset = pressed ? -0.004 : 0;
  const currentPos: [number, number, number] = [
    position[0],
    position[1],
    position[2] + buttonZOffset
  ];

  return (
    <group
      position={currentPos}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        setPressed(true);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        if (pressed) {
          onClick();
        }
        setPressed(false);
      }}
    >
      {/* Visual Button Mesh */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial
          color={hovered ? hoverColor : color}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Button Text */}
      <Text
        position={[0, 0, args[2] / 2 + 0.001]}
        fontSize={fontSize}
        color={labelColor}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
      >
        {label}
      </Text>
    </group>
  );
};

const XRConsole: React.FC<XRConsoleProps> = ({
  frameRef,
  selectedChannel,
  mode,
  isPaused,
  speed,
  togglePlayPause,
  setSpeed,
  startDemo,
  startLive,
  disconnect,
  selectTrial,
}) => {
  const [snapshot, setSnapshot] = useState<ConsoleSnapshot>(EMPTY_SNAPSHOT);
  const sigRef = useRef<string>("");

  useFrame((state) => {
    const inVR = state.gl.xr.isPresenting;

    // Off the XR path this console is hidden; skip all work and re-renders.
    if (!inVR) {
      if (sigRef.current !== "") {
        sigRef.current = "";
        setSnapshot(EMPTY_SNAPSHOT);
      }
      return;
    }

    const frame = frameRef.current;
    const currentValue =
      selectedChannel && frame.channels[selectedChannel]
        ? frame.channels[selectedChannel]!.value
        : 0;

    const next: ConsoleSnapshot = {
      inVR: true,
      phase: frame.phase,
      trialIndex: frame.trialIndex ?? 0,
      valence: frame.ratings?.valence,
      arousal: frame.ratings?.arousal,
      focus: frame.focus,
      focusAvg: frame.focus_avg ?? 0,
      currentValue,
    };

    // Only re-render when something the panel actually shows changes.
    const sig = `${next.phase}|${next.trialIndex}|${next.valence}|${next.arousal}|${
      next.focus === undefined ? "-" : Math.round(next.focus * 100)
    }|${Math.round(next.focusAvg * 100)}|${currentValue.toFixed(2)}|${selectedChannel ?? "-"}`;

    if (sig !== sigRef.current) {
      sigRef.current = sig;
      setSnapshot(next);
    }
  });

  if (!snapshot.inVR) return null;

  const contextLabel =
    snapshot.phase === "quality-check"
      ? "Monitoring Signal Quality"
      : `Trial ${snapshot.trialIndex + 1} · ${snapshot.phase === "baseline" ? "Baseline" : "Stimulus"}`;

  // Theme colors for active states (matching web UI colors)
  const isBaseline = snapshot.phase === "baseline";
  const glowColor = isBaseline ? "#6366f1" : "#10b981"; // Indigo vs Emerald
  const activeColor = isBaseline ? "#4f46e5" : "#059669";
  const hoverColor = isBaseline ? "#4338ca" : "#047857";

  return (
    <group position={[0.55, 1.2, -0.9]} rotation={[0, -Math.PI / 6, 0]}>
      {/* Dark Obsidian Glass Plate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.52, 0.015]} />
        <meshStandardMaterial
          color="#0b0f19"
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Dynamic Glowing Neon Border Backplate */}
      <mesh position={[0, 0, -0.009]}>
        <boxGeometry args={[0.56, 0.53, 0.004]} />
        <meshStandardMaterial
          color={snapshot.phase === "idle" ? "#334155" : glowColor}
          emissive={snapshot.phase === "idle" ? "#334155" : glowColor}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* ======================================================== */}
      {/* 1. IDLE/MAIN MENU VIEW                                   */}
      {/* ======================================================== */}
      {snapshot.phase === "idle" ? (
        <>
          {/* Header */}
          <Text
            position={[0, 0.16, 0.01]}
            fontSize={0.026}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
          >
            BRAINXR DASHBOARD
          </Text>
          <Text
            position={[0, 0.10, 0.01]}
            fontSize={0.013}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            Digital Twin Control Center
          </Text>
          <Text
            position={[0, 0.02, 0.01]}
            fontSize={0.011}
            color="#cbd5e1"
            anchorX="center"
            anchorY="middle"
          >
            Choose a mode to begin:
          </Text>

          {/* Action Buttons */}
          <XRButton
            position={[0, -0.05, 0.01]}
            args={[0.32, 0.05, 0.015]}
            label="Run Demo Mode"
            color="#1e293b"
            hoverColor="#4f46e5"
            onClick={startDemo}
            fontSize={0.013}
          />
          <XRButton
            position={[0, -0.13, 0.01]}
            args={[0.32, 0.05, 0.015]}
            label="Connect EEG Headset"
            color="#1e293b"
            hoverColor="#10b981"
            onClick={startLive}
            fontSize={0.013}
          />
        </>
      ) : (
        // ========================================================
        // 2. ACTIVE TRIAL / PLAYBACK VIEW                          
        // ========================================================
        <>
          {/* Title */}
          <Text
            position={[0, 0.20, 0.01]}
            fontSize={0.022}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
          >
            EEG DIGITAL TWIN
          </Text>

          {/* Status read-out */}
          <Text
            position={[0, 0.15, 0.01]}
            fontSize={0.013}
            color={glowColor}
            anchorX="center"
            anchorY="middle"
          >
            {contextLabel}
          </Text>

          {/* Real-time emotional / focus metrics */}
          {snapshot.phase === "stimulus" && (
            <>
              {snapshot.valence !== undefined && snapshot.arousal !== undefined && (
                <Text
                  position={[0, 0.10, 0.01]}
                  fontSize={0.012}
                  color="#cbd5e1"
                  anchorX="center"
                  anchorY="middle"
                >
                  {`Valence: ${snapshot.valence.toFixed(1)}   ·   Arousal: ${snapshot.arousal.toFixed(1)}`}
                </Text>
              )}
              {snapshot.focus !== undefined && (
                <Text
                  position={[0, 0.06, 0.01]}
                  fontSize={0.012}
                  color="#10b981"
                  anchorX="center"
                  anchorY="middle"
                >
                  {`Focus: ${Math.round(snapshot.focus * 100)}%   ·   Average: ${Math.round(snapshot.focusAvg * 100)}%`}
                </Text>
              )}
            </>
          )}

          {/* Sensor description / inspection box */}
          <group position={[0, -0.03, 0.01]}>
            <mesh>
              <boxGeometry args={[0.46, 0.075, 0.01]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} />
            </mesh>
            <Text
              position={[0, 0.014, 0.006]}
              fontSize={0.013}
              color="#cbd5e1"
              anchorX="center"
              anchorY="middle"
            >
              {selectedChannel ? `Electrode: ${selectedChannel}` : "Point/Click LED to Inspect"}
            </Text>
            <Text
              position={[0, -0.012, 0.006]}
              fontSize={0.011}
              color="#94a3b8"
              anchorX="center"
              anchorY="middle"
            >
              {selectedChannel ? `Value: ${snapshot.currentValue.toFixed(2)} µV` : "No Channel Selected"}
            </Text>
          </group>

          {/* Controls Separator */}
          <Text
            position={[0, -0.11, 0.01]}
            fontSize={0.009}
            color="#64748b"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
          >
            PLAYBACK CONTROLS
          </Text>

          {/* Buttons Row */}
          {/* Exit Button */}
          <XRButton
            position={[-0.18, -0.18, 0.01]}
            args={[0.08, 0.04, 0.01]}
            label="Exit"
            color="#334155"
            hoverColor="#ef4444"
            onClick={disconnect}
          />

          {/* Previous Trial */}
          <XRButton
            position={[-0.09, -0.18, 0.01]}
            args={[0.06, 0.04, 0.01]}
            label="Prev"
            color="#1e293b"
            hoverColor={hoverColor}
            onClick={() => selectTrial(Math.max(0, snapshot.trialIndex - 1))}
          />

          {/* Play/Pause */}
          <XRButton
            position={[0.0, -0.18, 0.01]}
            args={[0.10, 0.04, 0.01]}
            label={isPaused ? "Play" : "Pause"}
            color="#1e293b"
            hoverColor={hoverColor}
            onClick={togglePlayPause}
          />

          {/* Next Trial */}
          <XRButton
            position={[0.09, -0.18, 0.01]}
            args={[0.06, 0.04, 0.01]}
            label="Next"
            color="#1e293b"
            hoverColor={hoverColor}
            onClick={() => selectTrial(Math.min(39, snapshot.trialIndex + 1))}
          />

          {/* Speed (1x / 10x) */}
          <XRButton
            position={[0.18, -0.18, 0.01]}
            args={[0.08, 0.04, 0.01]}
            label={speed === 1 ? "10x" : "1x"}
            color="#1e293b"
            hoverColor={hoverColor}
            onClick={() => setSpeed(speed === 1 ? 10 : 1)}
          />
        </>
      )}
    </group>
  );
};

export default XRConsole;
