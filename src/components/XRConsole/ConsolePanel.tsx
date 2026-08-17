import React from "react";
import { Text } from "@react-three/drei";
import type { ElectrodeName } from "../../utils/signalSource";
import type { ConsoleSnapshot } from "./useConsoleSnapshot";
import XRButton from "./XRButton";

interface ConsolePanelProps {
  snapshot: ConsoleSnapshot;
  selectedChannel: ElectrodeName | null;
  onStartDemo?: () => void;
  onStartLive?: () => void;
}

// The console's 3D plate + text layout shown while presenting in WebXR.
const ConsolePanel: React.FC<ConsolePanelProps> = ({
  snapshot,
  selectedChannel,
  onStartDemo,
  onStartLive,
}) => {
  const isIdle = snapshot.phase === "idle";

  const contextLabel =
    snapshot.phase === "quality-check"
      ? "Monitoring Signal Quality"
      : `Trial ${snapshot.trialIndex + 1} · ${
          snapshot.phase === "baseline" ? "Baseline" : "Stimulus"
        }`;

  return (
    <group position={[0.55, 1.1, -0.9]} rotation={[0, -Math.PI / 6, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, isIdle ? 0.44 : 0.52, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.1} />
      </mesh>

      {isIdle ? (
        <>
          <Text
            position={[0, 0.15, 0.015]}
            fontSize={0.022}
            color="#0f172a"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
          >
            EEG DIGITAL TWIN
          </Text>

          <Text
            position={[0, 0.09, 0.015]}
            fontSize={0.014}
            color="#4f46e5"
            anchorX="center"
            anchorY="middle"
          >
            WebXR Control Center
          </Text>

          <Text
            position={[0, 0.05, 0.015]}
            fontSize={0.011}
            color="#64748b"
            anchorX="center"
            anchorY="middle"
          >
            Select a mode to launch visualization
          </Text>

          <XRButton
            position={[0, -0.02, 0.015]}
            width={0.4}
            height={0.055}
            label="Run Demo Mode"
            variant="primary"
            onClick={onStartDemo}
          />

          <XRButton
            position={[0, -0.09, 0.015]}
            width={0.4}
            height={0.055}
            label="Connect your EEG headset"
            variant="secondary"
            onClick={onStartLive}
          />
        </>
      ) : (
        <>
          <Text
            position={[0, 0.20, 0.015]}
            fontSize={0.022}
            color="#0f172a"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
          >
            EEG DIGITAL TWIN
          </Text>

          <Text
            position={[0, 0.14, 0.015]}
            fontSize={0.014}
            color="#4f46e5"
            anchorX="center"
            anchorY="middle"
          >
            {contextLabel}
          </Text>

          {snapshot.phase === "stimulus" &&
            snapshot.valence !== undefined &&
            snapshot.arousal !== undefined && (
              <Text
                position={[0, 0.09, 0.015]}
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
              position={[0, 0.05, 0.015]}
              fontSize={0.011}
              color="#10b981"
              anchorX="center"
              anchorY="middle"
            >
              {`Focus ${Math.round(snapshot.focus * 100)}%  Avg ${Math.round(snapshot.focusAvg * 100)}%`}
            </Text>
          )}

          <group position={[0, -0.01, 0.015]}>
            <mesh>
              <boxGeometry args={[0.42, 0.065, 0.012]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.15} />
            </mesh>
            <Text
              position={[0, 0.01, 0.007]}
              fontSize={0.013}
              color="#475569"
              anchorX="center"
              anchorY="middle"
            >
              {selectedChannel ? `Electrode: ${selectedChannel}` : "Point/Click LED to Inspect"}
            </Text>
            <Text
              position={[0, -0.011, 0.007]}
              fontSize={0.011}
              color="#64748b"
              anchorX="center"
              anchorY="middle"
            >
              {selectedChannel
                ? `Value: ${snapshot.currentValue.toFixed(2)} uV`
                : "No Channel Selected"}
            </Text>
          </group>

          <XRButton
            position={[0, -0.10, 0.015]}
            width={0.4}
            height={0.048}
            label="Run Demo Mode"
            variant="primary"
            onClick={onStartDemo}
          />

          <XRButton
            position={[0, -0.17, 0.015]}
            width={0.4}
            height={0.048}
            label="Connect your EEG headset"
            variant="secondary"
            onClick={onStartLive}
          />
        </>
      )}
    </group>
  );
};

export default ConsolePanel;

