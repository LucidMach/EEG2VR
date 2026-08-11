import { ELECTRODE_NAMES, type ElectrodeName } from "../../utils/signalSource";
import type { HistorySample } from "../../hooks/usePlaybackEngine";

export interface ScaleInfo {
  means: Record<string, number>;
  maxDeviation: number;
}

// Auto-scales the waveform display: finds each channel's mean and the
// largest deviation from its mean across all channels, so both DEAP's 0-1
// range and the larger procedural range render at a visible scale.
export function computeScale(histories: Record<ElectrodeName, HistorySample[]>): ScaleInfo {
  const means: Record<string, number> = {};
  let maxDeviation = 1.0; // minimum scale to avoid dividing by 0 / amplifying flat noise

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

  return { means, maxDeviation };
}
