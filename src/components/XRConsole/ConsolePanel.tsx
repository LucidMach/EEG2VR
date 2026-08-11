import React from "react";
import { Text } from "@react-three/drei";
import type { ElectrodeName } from "../../utils/signalSource";
import type { ConsoleSnapshot } from "./useConsoleSnapshot";

interface ConsolePanelProps {
  snapshot: ConsoleSnapshot;
  selectedChannel: ElectrodeName | null;
}

// The console's 3D plate + text layout. Assumes `snapshot.inVR` is already
// true and the phase isn't "idle" — index.tsx handles the null case.
const ConsolePanel: React.FC<ConsolePanelProps> = ({ snapshot, selectedChannel }) => {
  const contextLabel =
    snapshot.phase === "quality-check"
      ? "Monitoring Signal Quality"
      : `Trial ${snapshot.trialIndex + 1} · ${snapshot.phase === "baseline" ? "Baseline" : "Stimulus"}`;

  return (
    <group position={[0.55, 1.1, -0.9]} rotation={[0, -Math.PI / 6, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.42, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.1} />
      </mesh>

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

      <Text position={[0, 0.1, 0.015]} fontSize={0.014} color="#4f46e5" anchorX="center" anchorY="middle">
        {contextLabel}
      </Text>

      {snapshot.phase === "stimulus" && snapshot.valence !== undefined && snapshot.arousal !== undefined && (
        <Text position={[0, 0.06, 0.015]} fontSize={0.011} color="#64748b" anchorX="center" anchorY="middle">
          {`Valence ${snapshot.valence.toFixed(1)}  Arousal ${snapshot.arousal.toFixed(1)}`}
        </Text>
      )}

      {snapshot.phase === "stimulus" && snapshot.focus !== undefined && (
        <Text position={[0, 0.02, 0.015]} fontSize={0.011} color="#10b981" anchorX="center" anchorY="middle">
          {`Focus ${Math.round(snapshot.focus * 100)}%  Avg ${Math.round(snapshot.focusAvg * 100)}%`}
        </Text>
      )}

      <group position={[0, -0.05, 0.015]}>
        <mesh>
          <boxGeometry args={[0.42, 0.07, 0.012]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} />
        </mesh>
        <Text position={[0, 0.01, 0.007]} fontSize={0.014} color="#475569" anchorX="center" anchorY="middle">
          {selectedChannel ? `Electrode: ${selectedChannel}` : "Point/Click LED to Inspect"}
        </Text>
        <Text position={[0, -0.012, 0.007]} fontSize={0.012} color="#64748b" anchorX="center" anchorY="middle">
          {selectedChannel ? `Value: ${snapshot.currentValue.toFixed(2)} uV` : "No Channel Selected"}
        </Text>
      </group>
    </group>
  );
};

export default ConsolePanel;
