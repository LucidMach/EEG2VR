// Procedural adapter: synthesizes a plausible-looking EEG signal instead of
// replaying a recording. Covers the two states that don't involve real data —
// idle ambient "breathing" before any mode starts, and Live Mode's Quality
// Check, which visualizes simulated electrode/impedance health rather than
// brainwave content.
import { ELECTRODE_NAMES, type ElectrodeName, type Frame, type SignalSource } from "./signalSource";

function synthesizeChannelValue(time: number, idx: number): number {
  const deltaFreq = 1.5 + Math.sin(time * 0.1 + idx) * 0.3;
  const thetaFreq = 5.5 + Math.cos(time * 0.15 + idx) * 0.5;
  const alphaFreq = 10.0 + Math.sin(time * 0.2 + idx) * 0.8;
  const betaFreq = 20.0 + Math.cos(time * 0.3 + idx) * 2.0;
  const gammaFreq = 40.0 + Math.sin(time * 0.5 + idx) * 5.0;

  const aDelta = 6 + Math.cos(time * 0.1 + idx) * 1.5;
  const aTheta = 8 + Math.sin(time * 0.2 + idx) * 2;
  const aAlpha = 12 + Math.sin(time * 0.4 + idx) * 3;
  const aBeta = 10 + Math.cos(time * 0.6 + idx) * 2;
  const aGamma = 2 + Math.sin(time * 0.8 + idx) * 0.5;

  const phaseOffset = idx * 0.25;
  let value =
    aDelta * Math.sin(2 * Math.PI * deltaFreq * time + phaseOffset) +
    aTheta * Math.sin(2 * Math.PI * thetaFreq * time + phaseOffset * 1.2) +
    aAlpha * Math.sin(2 * Math.PI * alphaFreq * time + phaseOffset * 1.5) +
    aBeta * Math.sin(2 * Math.PI * betaFreq * time + phaseOffset * 1.8) +
    aGamma * Math.sin(2 * Math.PI * gammaFreq * time + phaseOffset * 2.2);

  value += (Math.random() - 0.5) * 2.5;
  return value;
}

export const idleSignalSource: SignalSource = {
  getFrame(elapsedSeconds): Frame {
    const channels: Frame["channels"] = {};
    ELECTRODE_NAMES.forEach((name, idx) => {
      channels[name] = { value: synthesizeChannelValue(elapsedSeconds, idx) };
    });
    return { phase: "idle", channels };
  },
};

// Electrodes forced into fair/poor connection quality so Quality Check has
// something to demonstrate.
const FAIR_QUALITY_ELECTRODES = new Set<ElectrodeName>(["F8", "T6"]);
const POOR_QUALITY_ELECTRODES = new Set<ElectrodeName>(["T3", "T4", "Fp1"]);

export const qualityCheckSignalSource: SignalSource = {
  getFrame(elapsedSeconds): Frame {
    const channels: Frame["channels"] = {};
    ELECTRODE_NAMES.forEach((name, idx) => {
      if (POOR_QUALITY_ELECTRODES.has(name)) {
        channels[name] = {
          value: (Math.random() - 0.5) * 15,
          quality: "poor",
          impedance: 25.0 + Math.sin(elapsedSeconds) * 2.0,
        };
      } else if (FAIR_QUALITY_ELECTRODES.has(name)) {
        channels[name] = {
          value: synthesizeChannelValue(elapsedSeconds, idx) * 0.5,
          quality: "fair",
          impedance: 12.0 + Math.cos(elapsedSeconds) * 1.5,
        };
      } else {
        channels[name] = {
          value: synthesizeChannelValue(elapsedSeconds, idx),
          quality: "good",
          impedance: 3.5 + Math.sin(elapsedSeconds * 0.05 + idx) * 1.2,
        };
      }
    });
    return { phase: "quality-check", channels };
  },
};
