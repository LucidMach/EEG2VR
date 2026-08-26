// Pure mapping from a Frame + electrode + time to how that electrode's LED
// should look. Pulled out of eegHead.tsx's useFrame callback so it's testable
// without mounting a Canvas — call it with fixed inputs and assert the output.
import * as THREE from "three";
import { ELECTRODE_METADATA, type ElectrodeName, type Frame } from "./signalSource";

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

export const REGION_COLOR: Record<string, string> = {
  Frontal: "#6366f1",   // Indigo
  Temporal: "#a855f7",  // Purple
  Central: "#3b82f6",   // Blue
  Parietal: "#06b6d4",   // Cyan
  Occipital: "#10b981", // Emerald
};

// Pre-allocated THREE.Color instances to avoid per-frame GC allocations
const IDLE_COLOR_OBJ = new THREE.Color(IDLE_COLOR);
const STIMULUS_COLOR_OBJ = new THREE.Color(STIMULUS_COLOR);
const QUALITY_COLOR_OBJS: Record<"good" | "fair" | "poor", THREE.Color> = {
  good: new THREE.Color(QUALITY_COLOR.good),
  fair: new THREE.Color(QUALITY_COLOR.fair),
  poor: new THREE.Color(QUALITY_COLOR.poor),
};
const REGION_COLOR_OBJS: Record<string, THREE.Color> = {
  Frontal: new THREE.Color(REGION_COLOR.Frontal),
  Temporal: new THREE.Color(REGION_COLOR.Temporal),
  Central: new THREE.Color(REGION_COLOR.Central),
  Parietal: new THREE.Color(REGION_COLOR.Parietal),
  Occipital: new THREE.Color(REGION_COLOR.Occipital),
};

function qualityCheckState(quality: "good" | "fair" | "poor", time: number, value: number): ElectrodeVisualState {
  const color = QUALITY_COLOR_OBJS[quality] ?? QUALITY_COLOR_OBJS.good;

  if (quality === "good") {
    return { color, intensity: Math.abs(value), opacity: 0.8 };
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

function stimulusState(electrodeName: ElectrodeName, value: number): ElectrodeVisualState {
  const amp = Math.abs(value);
  const normalized = Math.min(amp, 1.0);
  const intensity = (0.15 + normalized * 1.85) * 1.5;

  const region = ELECTRODE_METADATA[electrodeName]?.region;
  const color = (region && REGION_COLOR_OBJS[region]) || STIMULUS_COLOR_OBJ;

  return { color, intensity, opacity: 1.0 };
}

export function computeElectrodeVisualState(
  frame: Frame,
  electrodeName: ElectrodeName,
  time: number
): ElectrodeVisualState {
  const sample = frame.channels[electrodeName];

  if (frame.phase === "idle" || frame.phase === "baseline" || !sample) {
    return { color: IDLE_COLOR_OBJ, intensity: 0, opacity: frame.phase === "baseline" ? 0.5 : 0.4 };
  }

  if (frame.phase === "quality-check") {
    return qualityCheckState(sample.quality ?? "good", time, sample.value);
  }

  return stimulusState(electrodeName, sample.value);
}
