import type { ElectrodeName, SignalSource, TrialRatings } from "../signalSource";

// The asset contract agreed with the teammate producing the DEAP export:
// one file per participant, trials bundled in playback order, channels keyed
// by 10-20 electrode name (not DEAP's raw channel index).
export interface DeapTrialAsset {
  trialIndex: number;
  stimulusId: string;
  channels: Record<string, number[]>;
  ratings: TrialRatings;
  focus?: number[];
  focus_avg?: number;
}

export interface DeapSessionAsset {
  participantId: number;
  trials: DeapTrialAsset[];
}

export interface LoadedTrial {
  stimulusId: string;
  ratings: TrialRatings;
  channels: Partial<Record<ElectrodeName, number[]>>;
  focus?: number[];
  focus_avg?: number;
}

export interface DeapSignalSource extends SignalSource {
  // Resolves once the participant asset has loaded; getFrame returns an
  // empty idle frame before that.
  ready: Promise<void>;
}
