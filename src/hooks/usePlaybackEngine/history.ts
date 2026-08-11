import { ELECTRODE_NAMES, type ElectrodeName } from "../../utils/signalSource";

export const HISTORY_LIMIT = 60; // 3 seconds at 20 Hz (20 * 3 = 60 samples)

export interface HistorySample {
  value: number;
  isBaseline: boolean;
}

export type Histories = Record<ElectrodeName, HistorySample[]>;

export function createEmptyHistories(): Histories {
  const initial: Partial<Histories> = {};
  ELECTRODE_NAMES.forEach((name) => {
    initial[name] = [];
  });
  return initial as Histories;
}

// Empties the ring buffers in place, so the ref identity stays stable and
// consumers keep reading the same object.
export function clearHistories(histories: Histories): void {
  ELECTRODE_NAMES.forEach((name) => {
    histories[name].length = 0;
  });
}

// Appends in place and drops the oldest sample once over HISTORY_LIMIT.
export function pushSample(histories: Histories, name: ElectrodeName, sample: HistorySample): void {
  const arr = histories[name];
  arr.push(sample);
  if (arr.length > HISTORY_LIMIT) arr.shift();
}
