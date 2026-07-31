// Floating 3D control board, shown only while presenting in WebXR.
//
// Reads the live frame from a ref (its parent subtree is memoized off the
// React tick) and republishes just the values it displays into local state,
// and only while actually presenting in XR — so the 2D showcase path never
// re-renders this at all.
import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { ElectrodeName, Frame } from "../utils/signalSource";

interface XRConsoleProps {
  frameRef: React.RefObject<Frame>;
  selectedChannel: ElectrodeName | null;
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

const XRConsole: React.FC<XRConsoleProps> = ({ frameRef, selectedChannel }) => {
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

  if (!snapshot.inVR || snapshot.phase === "idle") return null;

  const contextLabel =
    snapshot.phase === "quality-check"
      ? "Monitoring Signal Quality"
      : `Trial ${snapshot.trialIndex + 1} · ${snapshot.phase === "baseline" ? "Baseline" : "Stimulus"}`;

  return (
    <group position={[0.55, 1.1, -0.9]} rotation={[0, -Math.PI / 6, 0]}>
      {/* Console Plate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.42, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.1} />
      </mesh>

      {/* Title */}
      <Text
        position={[0, 0.16, 0.015]}
        fontSize={0.022}
        color="#0f172a"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
      >
        EEG DIGITAL TWIN
      </Text>

      {/* Context readout: current trial/phase, or connection-quality status */}
      <Text
        position={[0, 0.1, 0.015]}
        fontSize={0.014}
        color="#4f46e5"
        anchorX="center"
        anchorY="middle"
      >
        {contextLabel}
      </Text>

      {snapshot.phase === "stimulus" && snapshot.valence !== undefined && snapshot.arousal !== undefined && (
        <Text
          position={[0, 0.06, 0.015]}
          fontSize={0.011}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {`Valence ${snapshot.valence.toFixed(1)}  Arousal ${snapshot.arousal.toFixed(1)}`}
        </Text>
      )}

      {snapshot.phase === "stimulus" && snapshot.focus !== undefined && (
        <Text
          position={[0, 0.02, 0.015]}
          fontSize={0.011}
          color="#10b981"
          anchorX="center"
          anchorY="middle"
        >
          {`Focus ${Math.round(snapshot.focus * 100)}%  Avg ${Math.round(snapshot.focusAvg * 100)}%`}
        </Text>
      )}

      {/* Sensor Monitor Box */}
      <group position={[0, -0.05, 0.015]}>
        <mesh>
          <boxGeometry args={[0.42, 0.07, 0.012]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} />
        </mesh>
        <Text
          position={[0, 0.01, 0.007]}
          fontSize={0.014}
          color="#475569"
          anchorX="center"
          anchorY="middle"
        >
          {selectedChannel
            ? `Electrode: ${selectedChannel}`
            : "Point/Click LED to Inspect"}
        </Text>
        <Text
          position={[0, -0.012, 0.007]}
          fontSize={0.012}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {selectedChannel
            ? `Value: ${snapshot.currentValue.toFixed(2)} uV`
            : "No Channel Selected"}
        </Text>
      </group>
    </group>
  );
};

export default XRConsole;
