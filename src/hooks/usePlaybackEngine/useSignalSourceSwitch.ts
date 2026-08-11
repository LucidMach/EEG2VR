import { useEffect, type RefObject } from "react";
import type { SignalSource } from "../../utils/signalSource";
import { idleSignalSource, qualityCheckSignalSource } from "../../utils/proceduralSignalSource";
import { createDeapSignalSource } from "../../utils/deapSignalSource";
import type { AppMode } from "../../utils/appMode";
import { clearHistories, type Histories } from "./history";

interface Params {
  mode: AppMode;
  timeRef: RefObject<number>;
  sourceRef: RefObject<SignalSource>;
  historiesRef: RefObject<Histories>;
  setSpeed: (speed: number) => void;
  setIsPaused: (paused: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

// Swaps the active SignalSource whenever the mode changes, and restarts the
// elapsed-time clock so playback always begins from trial 0 / baseline.
export function useSignalSourceSwitch({
  mode,
  timeRef,
  sourceRef,
  historiesRef,
  setSpeed,
  setIsPaused,
  setIsLoading,
}: Params): void {
  useEffect(() => {
    timeRef.current = 0;
    setSpeed(1);
    setIsPaused(false);
    clearHistories(historiesRef.current);

    if (mode.kind === "idle") {
      sourceRef.current = idleSignalSource;
      setIsLoading(false);
    } else if (mode.kind === "demo") {
      const source = createDeapSignalSource();
      sourceRef.current = source;
      // The DEAP asset is a multi-MB fetch; surface a loading state until the
      // participant's trials have parsed, then let playback take over.
      setIsLoading(true);
      let cancelled = false;
      source.ready.finally(() => {
        if (!cancelled) setIsLoading(false);
      });
      return () => {
        cancelled = true;
      };
    } else if (mode.kind === "live" && mode.connection === "connected") {
      sourceRef.current = qualityCheckSignalSource;
      setIsLoading(false);
    }
  }, [mode]);
}
