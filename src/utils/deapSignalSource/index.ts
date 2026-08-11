// DEAP-playback adapter: replays participant 7's recorded trial data instead
// of synthesizing anything. Owns the trial/phase timing (3s baseline + 60s
// stimulus per trial, 40 trials flowing one into the next) so callers never
// hardcode those constants — they just read Frame.phase off what comes back.
import { ELECTRODE_NAMES, type Frame } from "../signalSource";
import { filterToMappedElectrodes } from "./filterToMappedElectrodes";
import type { DeapSessionAsset, DeapSignalSource, LoadedTrial } from "./types";

export type { DeapSignalSource } from "./types";

const SAMPLE_RATE_HZ = 128;
const BASELINE_SECONDS = 3;
const TRIAL_SECONDS = 63; // 3s baseline + 60s stimulus, per DEAP's protocol
const SAMPLES_PER_TRIAL = TRIAL_SECONDS * SAMPLE_RATE_HZ;

export function createDeapSignalSource(assetUrl = "/deap/participant-07.json"): DeapSignalSource {
  let trials: LoadedTrial[] = [];

  const ready = fetch(assetUrl)
    .then((res) => res.json() as Promise<DeapSessionAsset>)
    .then((asset) => {
      trials = asset.trials.map((trial) => ({
        stimulusId: trial.stimulusId,
        ratings: trial.ratings,
        channels: filterToMappedElectrodes(trial.channels),
        focus: trial.focus,
        focus_avg: trial.focus_avg,
      }));
    });

  return {
    ready,
    getFrame(elapsedSeconds: number): Frame {
      if (trials.length === 0) {
        return { phase: "idle", channels: {} };
      }

      // Support 40 trials on the UI (wraps around indices to actual loaded trials)
      const unwrappedTrialIndex = Math.floor(elapsedSeconds / TRIAL_SECONDS) % 40;
      const trialIndex = unwrappedTrialIndex % trials.length;
      const trialElapsed = elapsedSeconds % TRIAL_SECONDS;
      const trial = trials[trialIndex];
      const phase = trialElapsed < BASELINE_SECONDS ? "baseline" : "stimulus";
      const sampleIndex = Math.min(
        Math.floor(trialElapsed * SAMPLE_RATE_HZ),
        SAMPLES_PER_TRIAL - 1
      );

      const channels: Frame["channels"] = {};
      for (const name of ELECTRODE_NAMES) {
        const series = trial.channels[name];
        if (series) channels[name] = { value: series[sampleIndex] ?? 0 };
      }

      return {
        phase,
        channels,
        trialIndex: unwrappedTrialIndex,
        stimulusId: trial.stimulusId,
        ratings: trial.ratings,
        trialElapsed,
        focus: trial.focus ? trial.focus[Math.floor(trialElapsed)] : undefined,
        focus_avg: trial.focus_avg,
        totalTrials: 40,
      };
    },
  };
}
