import { useEffect, useRef, type RefObject } from "react";
import { ELECTRODE_NAMES, type Frame, type SignalSource } from "../../utils/signalSource";
import type { AppMode } from "../../utils/appMode";
import { pushSample, type Histories } from "./history";

const FRAME_INTERVAL_MS = 50;
const TRIAL_SECONDS = 63; // 3s baseline + 60s stimulus, per DEAP's protocol
const BASELINE_SECONDS = 3;

interface Params {
  speed: number;
  isPaused: boolean;
  modeRef: RefObject<AppMode>;
  timeRef: RefObject<number>;
  sourceRef: RefObject<SignalSource>;
  frameRef: RefObject<Frame>;
  historiesRef: RefObject<Histories>;
  audioRef: RefObject<HTMLAudioElement | null>;
  audioHasErrorRef: RefObject<boolean>;
  syncTrialAudio: (trialIndex: number, startOffset?: number) => void;
  playStimulusAudio: () => void;
  setFrame: (frame: Frame) => void;
}

// 20 Hz playback clock: during demo stimulus, slaved to the <audio> element as
// master clock; during baseline, idle, or live modes, uses performance.now() delta timing.
export function useFrameTick({
  speed,
  isPaused,
  modeRef,
  timeRef,
  sourceRef,
  frameRef,
  historiesRef,
  audioRef,
  audioHasErrorRef,
  syncTrialAudio,
  playStimulusAudio,
  setFrame,
}: Params): void {
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    lastTimeRef.current = performance.now();
    if (isPaused) return;

    const timer = setInterval(() => {
      const now = performance.now();
      const deltaSec = Math.min((now - lastTimeRef.current) / 1000, 0.2) * speed;
      lastTimeRef.current = now;

      const isDemo = modeRef.current.kind === "demo";

      if (isDemo) {
        const currentTotalTime = timeRef.current;
        const currentTrialIndex = Math.floor(currentTotalTime / TRIAL_SECONDS) % 40;
        const trialStart = currentTrialIndex * TRIAL_SECONDS;
        const trialElapsed = currentTotalTime % TRIAL_SECONDS;

        const audio = audioRef.current;
        const hasWorkingAudio = audio && !audioHasErrorRef.current;

        if (
          trialElapsed >= BASELINE_SECONDS &&
          hasWorkingAudio &&
          !audio.paused &&
          audio.readyState >= 1
        ) {
          // ==========================================
          // AUDIO MASTER CLOCK (Stimulus Phase)
          // ==========================================
          const stimulusAudioTime = audio.currentTime;

          // If track ended or reached 60s stimulus duration, advance to next trial
          if (audio.ended || stimulusAudioTime >= TRIAL_SECONDS - BASELINE_SECONDS) {
            const nextTrialIndex = (currentTrialIndex + 1) % 40;
            timeRef.current = nextTrialIndex * TRIAL_SECONDS;
            syncTrialAudio(nextTrialIndex, 0);
          } else {
            timeRef.current = trialStart + BASELINE_SECONDS + stimulusAudioTime;
          }
        } else {
          // ==========================================
          // WALL-CLOCK FALLBACK (Baseline or Non-Audio)
          // ==========================================
          const nextTime = currentTotalTime + deltaSec;
          const nextTrialElapsed = nextTime % TRIAL_SECONDS;

          // Transition from Baseline (0..3s) into Stimulus (3s..63s)
          if (trialElapsed < BASELINE_SECONDS && nextTrialElapsed >= BASELINE_SECONDS) {
            timeRef.current = trialStart + BASELINE_SECONDS;
            playStimulusAudio();
          } else if (Math.floor(nextTime / TRIAL_SECONDS) % 40 !== currentTrialIndex) {
            // Reached end of trial on fallback clock
            const nextTrialIndex = (currentTrialIndex + 1) % 40;
            timeRef.current = nextTrialIndex * TRIAL_SECONDS;
            syncTrialAudio(nextTrialIndex, 0);
          } else {
            timeRef.current = nextTime;
          }
        }
      } else {
        // Idle or Live Mode
        timeRef.current += deltaSec;
      }

      const nextFrame = sourceRef.current.getFrame(timeRef.current);
      frameRef.current = nextFrame;
      setFrame(nextFrame);

      // Mutate the ring buffers in place — no per-tick array/object cloning
      const isBaseline = nextFrame.phase === "baseline";
      const histories = historiesRef.current;
      ELECTRODE_NAMES.forEach((name) => {
        pushSample(histories, name, { value: nextFrame.channels[name]?.value ?? 0, isBaseline });
      });
    }, FRAME_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [
    speed,
    isPaused,
    modeRef,
    timeRef,
    sourceRef,
    frameRef,
    historiesRef,
    audioRef,
    audioHasErrorRef,
    syncTrialAudio,
    playStimulusAudio,
    setFrame,
  ]);
}

export { TRIAL_SECONDS, BASELINE_SECONDS };

