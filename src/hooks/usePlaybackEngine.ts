// Owns the app's playback state machine: which SignalSource is active, the
// 20 Hz frame tick, trial-seek arithmetic, and the value-history ring buffer.
// Pulled out of the render component so this behaviour has an interface that
// can be exercised without mounting a Canvas — the interface returned below
// is the test surface.
import { useCallback, useEffect, useRef, useState } from "react";
import type { ElectrodeName, Frame, SignalSource } from "../utils/signalSource";
import { idleSignalSource, qualityCheckSignalSource } from "../utils/proceduralSignalSource";
import { createDeapSignalSource } from "../utils/deapSignalSource";
import { simulateHeadsetConnection } from "../utils/connectionFlow";
import type { AppMode } from "../utils/appMode";

const FRAME_INTERVAL_MS = 50;
const HISTORY_LIMIT = 120;
const TRIAL_SECONDS = 63; // 3s baseline + 60s stimulus, per DEAP's protocol

const INITIAL_FRAME: Frame = idleSignalSource.getFrame(0);

export interface PlaybackEngine {
  mode: AppMode;
  frame: Frame;
  history: number[];
  speed: number;
  selectedChannel: ElectrodeName | null;
  selectChannel: (name: ElectrodeName) => void;
  setSpeed: (speed: number) => void;
  startDemo: () => void;
  startLive: () => void;
  disconnect: () => void;
  selectTrial: (index: number, startOffset?: number) => void;
}

export function usePlaybackEngine(): PlaybackEngine {
  const [mode, setMode] = useState<AppMode>({ kind: "idle" });
  const [selectedChannel, setSelectedChannel] = useState<ElectrodeName | null>("Cz");
  const [frame, setFrame] = useState<Frame>(INITIAL_FRAME);
  const [history, setHistory] = useState<number[]>([]);
  const [speed, setSpeed] = useState<number>(1);

  const timeRef = useRef<number>(0);
  const sourceRef = useRef<SignalSource>(idleSignalSource);
  const cancelConnectionRef = useRef<() => void>(() => {});

  // Swap the active SignalSource whenever the mode changes, and restart the
  // elapsed-time clock so playback always begins from trial 0 / baseline.
  useEffect(() => {
    timeRef.current = 0;
    setSpeed(1);

    if (mode.kind === "idle") {
      sourceRef.current = idleSignalSource;
    } else if (mode.kind === "demo") {
      sourceRef.current = createDeapSignalSource();
    } else if (mode.kind === "live" && mode.connection === "connected") {
      sourceRef.current = qualityCheckSignalSource;
    }
  }, [mode]);

  // Single persistent data loop: ask whichever SignalSource is active for the
  // frame at the current elapsed time. Same call site regardless of whether
  // that's the procedural generator or the DEAP-playback adapter.
  useEffect(() => {
    const timer = setInterval(() => {
      timeRef.current += (FRAME_INTERVAL_MS / 1000) * speed;
      const nextFrame = sourceRef.current.getFrame(timeRef.current);
      setFrame(nextFrame);

      if (nextFrame.phase !== "idle" && selectedChannel) {
        const val = nextFrame.channels[selectedChannel]?.value ?? 0;
        setHistory((prev) => {
          const next = [...prev, val];
          if (next.length > HISTORY_LIMIT) next.shift();
          return next;
        });
      }
    }, FRAME_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [selectedChannel, speed]);

  // Clear value history when switching channel or restarting a mode.
  useEffect(() => {
    setHistory([]);
  }, [selectedChannel, mode.kind]);

  // Cancel any pending mock-connection timers on unmount.
  useEffect(() => () => cancelConnectionRef.current(), []);

  const selectTrial = useCallback((index: number, startOffset = 0) => {
    timeRef.current = index * TRIAL_SECONDS + startOffset;
    setHistory([]);
    setFrame(sourceRef.current.getFrame(timeRef.current));
  }, []);

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

  return {
    mode,
    frame,
    history,
    speed,
    selectedChannel,
    selectChannel: setSelectedChannel,
    setSpeed,
    startDemo,
    startLive,
    disconnect,
    selectTrial,
  };
}
