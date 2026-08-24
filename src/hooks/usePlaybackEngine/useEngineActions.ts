import { useCallback, type RefObject } from "react";
import type { ElectrodeName, Frame, SignalSource } from "../../utils/signalSource";
import type { AppMode } from "../../utils/appMode";
import { simulateHeadsetConnection } from "../../utils/connectionFlow";
import { clearHistories, type Histories } from "./history";
import { TRIAL_SECONDS } from "./useFrameTick";

interface Params {
  timeRef: RefObject<number>;
  sourceRef: RefObject<SignalSource>;
  frameRef: RefObject<Frame>;
  historiesRef: RefObject<Histories>;
  cancelConnectionRef: RefObject<() => void>;
  syncTrialAudio: (trialIndex: number, startOffset?: number) => void;
  setMode: (mode: AppMode) => void;
  setSelectedChannel: (name: ElectrodeName | null) => void;
  setFrame: (frame: Frame) => void;
  setIsPaused: (updater: (prev: boolean) => boolean) => void;
}

// The mutator half of the playback engine's public interface: trial seeking
// and mode transitions. Split from the data-flow hooks (useSignalSourceSwitch,
// useFrameTick) so this file is just "what can the UI ask the engine to do".
export function useEngineActions({
  timeRef,
  sourceRef,
  frameRef,
  historiesRef,
  cancelConnectionRef,
  syncTrialAudio,
  setMode,
  setSelectedChannel,
  setFrame,
  setIsPaused,
}: Params) {
  const selectTrial = useCallback((index: number, startOffset = 0) => {
    timeRef.current = index * TRIAL_SECONDS + startOffset;
    clearHistories(historiesRef.current);
    syncTrialAudio(index, startOffset);
    const nextFrame = sourceRef.current.getFrame(timeRef.current);
    frameRef.current = nextFrame;
    setFrame(nextFrame);
  }, [sourceRef, timeRef, frameRef, historiesRef, syncTrialAudio, setFrame]);

  const startDemo = useCallback(() => {
    cancelConnectionRef.current();
    setMode({ kind: "demo" });
    setSelectedChannel("Cz");
  }, []);

  const startLive = useCallback(() => {
    cancelConnectionRef.current();
    setMode({ kind: "live", connection: "searching" });

    cancelConnectionRef.current = simulateHeadsetConnection((progress) => {
      setMode({ kind: "live", connection: progress.step, device: progress.device });
      if (progress.step === "connected") {
        setSelectedChannel("Cz");
      }
    });
  }, []);

  const disconnect = useCallback(() => {
    cancelConnectionRef.current();
    setMode({ kind: "idle" });
    setSelectedChannel("Cz");
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  return { selectTrial, startDemo, startLive, disconnect, togglePlayPause };
}
