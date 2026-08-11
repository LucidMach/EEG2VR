import { useEffect, type RefObject } from "react";
import { ELECTRODE_NAMES, type Frame, type SignalSource } from "../../utils/signalSource";
import type { AppMode } from "../../utils/appMode";
import { pushSample, type Histories } from "./history";

const FRAME_INTERVAL_MS = 50;
const TRIAL_SECONDS = 63; // 3s baseline + 60s stimulus, per DEAP's protocol

interface Params {
  speed: number;
  isPaused: boolean;
  modeRef: RefObject<AppMode>;
  timeRef: RefObject<number>;
  sourceRef: RefObject<SignalSource>;
  frameRef: RefObject<Frame>;
  historiesRef: RefObject<Histories>;
  setFrame: (frame: Frame) => void;
}

// Single persistent 20 Hz data loop: asks whichever SignalSource is active
// for the frame at the current elapsed time. Publishes to the refs every
// tick (for the render loop) and to `frame` state (for the DOM HUD).
export function useFrameTick({
  speed,
  isPaused,
  modeRef,
  timeRef,
  sourceRef,
  frameRef,
  historiesRef,
  setFrame,
}: Params): void {
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      let nextTime = timeRef.current + (FRAME_INTERVAL_MS / 1000) * speed;
      if (modeRef.current.kind === "demo") {
        const maxTime = 40 * TRIAL_SECONDS;
        if (nextTime >= maxTime) {
          nextTime = nextTime % maxTime;
        }
      }
      timeRef.current = nextTime;
      const nextFrame = sourceRef.current.getFrame(nextTime);
      frameRef.current = nextFrame;
      setFrame(nextFrame);

      // Mutate the ring buffers in place — no per-tick array/object cloning,
      // so this doesn't churn the GC or trigger a React re-render.
      const isBaseline = nextFrame.phase === "baseline";
      const histories = historiesRef.current;
      ELECTRODE_NAMES.forEach((name) => {
        pushSample(histories, name, { value: nextFrame.channels[name]?.value ?? 0, isBaseline });
      });
    }, FRAME_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [speed, isPaused]);
}

export { TRIAL_SECONDS };
