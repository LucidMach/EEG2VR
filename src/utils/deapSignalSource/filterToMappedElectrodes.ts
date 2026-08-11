import { ELECTRODE_NAMES, type ElectrodeName } from "../signalSource";

// Drops any DEAP channel with no matching 10-20 electrode position on the
// Digital Twin — per CONTEXT.md's Electrode definition, those are dropped
// rather than shown.
export function filterToMappedElectrodes(
  channels: Record<string, number[]>
): Partial<Record<ElectrodeName, number[]>> {
  const mapped: Partial<Record<ElectrodeName, number[]>> = {};
  for (const name of ELECTRODE_NAMES) {
    if (channels[name]) mapped[name] = channels[name];
  }
  return mapped;
}
