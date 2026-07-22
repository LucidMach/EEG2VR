// Floating 3D control board, shown only while presenting in WebXR.
import React, { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { ElectrodeName, Frame } from "../utils/signalSource";

interface XRConsoleProps {
  frame: Frame;
  selectedChannel: ElectrodeName | null;
  currentValue: number;
}

const XRConsole: React.FC<XRConsoleProps> = ({ frame, selectedChannel, currentValue }) => {
  const [inVR, setInVR] = useState(false);

  useFrame((state) => {
    setInVR(state.gl.xr.isPresenting);
  });

  if (!inVR || frame.phase === "idle") return null;

  const contextLabel =
    frame.phase === "quality-check"
      ? "Monitoring Signal Quality"
      : `Trial ${(frame.trialIndex ?? 0) + 1} · ${frame.phase === "baseline" ? "Baseline" : "Stimulus"}`;

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

      {frame.phase === "stimulus" && frame.ratings && (
        <Text
          position={[0, 0.06, 0.015]}
          fontSize={0.011}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {`Valence ${frame.ratings.valence.toFixed(1)}  Arousal ${frame.ratings.arousal.toFixed(1)}`}
        </Text>
      )}

      {frame.phase === "stimulus" && frame.focus !== undefined && (
        <Text
          position={[0, 0.02, 0.015]}
          fontSize={0.011}
          color="#10b981"
          anchorX="center"
          anchorY="middle"
        >
          {`Focus ${Math.round(frame.focus * 100)}%  Avg ${Math.round((frame.focus_avg ?? 0) * 100)}%`}
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
            ? `Value: ${currentValue.toFixed(2)} uV`
            : "No Channel Selected"}
        </Text>
      </group>
    </group>
  );
};

export default XRConsole;
