// Pure mapping from a Frame + electrode + time to how that electrode's LED
// should look. Pulled out of eegHead.tsx's useFrame callback so it's testable
// without mounting a Canvas — call it with fixed inputs and assert the output.
import * as THREE from "three";
import type { ElectrodeName, Frame } from "./signalSource";

export interface ElectrodeVisualState {
  color: THREE.Color;
  intensity: number;
  opacity: number;
}

const IDLE_COLOR = "#1e293b";
const STIMULUS_COLOR = "#00ff55";
const QUALITY_COLOR: Record<"good" | "fair" | "poor", string> = {
  good: "#00ff66",
  fair: "#ffb700",
  poor: "#ff3333",
};

function qualityCheckState(quality: "good" | "fair" | "poor", time: number): ElectrodeVisualState {
  const color = new THREE.Color(QUALITY_COLOR[quality]);

  if (quality === "good") {
    return { color, intensity: 1.0, opacity: 0.8 };
  }

  const blinkHz = quality === "fair" ? 18 : 36;
  const onIntensity = quality === "fair" ? 1.0 : 1.3;
  const onOpacity = quality === "fair" ? 0.8 : 0.9;
  const offIntensity = quality === "fair" ? 0.15 : 0.1;
  const offOpacity = quality === "fair" ? 0.1 : 0.05;

  const isOn = Math.sin(time * blinkHz) > 0;
  return {
    color,
    intensity: isOn ? onIntensity : offIntensity,
    opacity: isOn ? onOpacity : offOpacity,
  };
}

function stimulusState(value: number, time: number): ElectrodeVisualState {
  const amp = Math.abs(value);
  const normalized = Math.min(amp, 1.0);
  const pulse = Math.sin(time * 12) * 0.35 + 1.25;
  const intensity = Math.max((0.15 + normalized * 1.85) * 1.5, 1.5) * pulse;

  return { color: new THREE.Color(STIMULUS_COLOR), intensity, opacity: 1.0 };
}

export function computeElectrodeVisualState(
  frame: Frame,
  electrodeName: ElectrodeName,
  time: number
): ElectrodeVisualState {
  const sample = frame.channels[electrodeName];

  if (frame.phase === "idle" || frame.phase === "baseline" || !sample) {
    return { color: new THREE.Color(IDLE_COLOR), intensity: 0, opacity: frame.phase === "baseline" ? 0.5 : 0.4 };
  }

  if (frame.phase === "quality-check") {
    return qualityCheckState(sample.quality ?? "good", time);
  }

  return stimulusState(sample.value, time);
}
