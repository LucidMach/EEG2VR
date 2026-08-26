// Owns the app's playback state machine: which SignalSource is active, the
// 20 Hz frame tick, trial-seek arithmetic, and the value-history ring buffer.
// Pulled out of the render component so this behaviour has an interface that
// can be exercised without mounting a Canvas — the interface returned below
// is the test surface.
//
// Performance seam: the 20 Hz data flows to the 3D scene and the background
// oscilloscope through *refs* (frameRef, historiesRef), not React state, so
// those high-frequency consumers animate off their own render loops without
// re-rendering the React tree. Only the DOM HUD reads `frame` state.
import { useEffect, useRef, useState } from "react";
import { idleSignalSource } from "../../utils/proceduralSignalSource";
import type { ElectrodeName, Frame, SignalSource } from "../../utils/signalSource";
import type { AppMode } from "../../utils/appMode";
import { createEmptyHistories } from "./history";
import { useSignalSourceSwitch } from "./useSignalSourceSwitch";
import { useFrameTick } from "./useFrameTick";
import { useAudioSync } from "./useAudioSync";
import { useEngineActions } from "./useEngineActions";
import type { PlaybackEngine } from "./types";

export type { PlaybackEngine } from "./types";
export type { HistorySample } from "./history";

const INITIAL_FRAME: Frame = idleSignalSource.getFrame(0);

export function usePlaybackEngine(): PlaybackEngine {
  const [mode, setMode] = useState<AppMode>({ kind: "idle" });
  const [selectedChannel, setSelectedChannel] = useState<ElectrodeName | null>(null);
  const [frame, setFrame] = useState<Frame>(INITIAL_FRAME);
  const [speed, setSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const timeRef = useRef<number>(0);
  const sourceRef = useRef<SignalSource>(idleSignalSource);
  const cancelConnectionRef = useRef<() => void>(() => {});

  // High-frequency data channels the 3D scene and oscilloscope read directly.
  const frameRef = useRef<Frame>(INITIAL_FRAME);
  const historiesRef = useRef(createEmptyHistories());
  const modeRef = useRef<AppMode>(mode);
  modeRef.current = mode;

  const audioController = useAudioSync({ mode, isPaused, speed, timeRef });

  useSignalSourceSwitch({ mode, timeRef, sourceRef, historiesRef, setSpeed, setIsPaused, setIsLoading });
  useFrameTick({
    speed,
    isPaused,
    modeRef,
    timeRef,
    sourceRef,
    frameRef,
    historiesRef,
    audioRef: audioController.audioRef,
    audioHasErrorRef: audioController.audioHasErrorRef,
    syncTrialAudio: audioController.syncTrialAudio,
    playStimulusAudio: audioController.playStimulusAudio,
    setFrame,
  });

  const { selectTrial, startDemo, startLive, disconnect, togglePlayPause } = useEngineActions({
    timeRef,
    sourceRef,
    frameRef,
    historiesRef,
    cancelConnectionRef,
    syncTrialAudio: audioController.syncTrialAudio,
    setMode,
    setFrame,
    setIsPaused,
  });

  // Cancel any pending mock-connection timers on unmount.
  useEffect(() => () => cancelConnectionRef.current(), []);

  return {
    mode,
    frame,
    frameRef,
    historiesRef,
    speed,
    isPaused,
    isLoading,
    togglePlayPause,
    selectedChannel,
    selectChannel: setSelectedChannel,
    setSpeed,
    startDemo,
    startLive,
    disconnect,
    selectTrial,
    audioError: audioController.audioError,
  };
}
