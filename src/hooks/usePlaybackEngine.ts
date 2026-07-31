// Owns the app's playback state machine: which SignalSource is active, the
// 20 Hz frame tick, trial-seek arithmetic, and the value-history ring buffer.
// Pulled out of the render component so this behaviour has an interface that
// can be exercised without mounting a Canvas — the interface returned below
// is the test surface.
import { useCallback, useEffect, useRef, useState } from "react";
import { ELECTRODE_NAMES, type ElectrodeName, type Frame, type SignalSource } from "../utils/signalSource";
import { idleSignalSource, qualityCheckSignalSource } from "../utils/proceduralSignalSource";
import { createDeapSignalSource } from "../utils/deapSignalSource";
import { simulateHeadsetConnection } from "../utils/connectionFlow";
import type { AppMode } from "../utils/appMode";

const FRAME_INTERVAL_MS = 50;
const HISTORY_LIMIT = 60; // 3 seconds at 20 Hz (20 * 3 = 60 samples)
const TRIAL_SECONDS = 63; // 3s baseline + 60s stimulus, per DEAP's protocol

const INITIAL_FRAME: Frame = idleSignalSource.getFrame(0);

export interface HistorySample {
  value: number;
  isBaseline: boolean;
}

export interface PlaybackEngine {
  mode: AppMode;
  frame: Frame;
  history: number[];
  histories: Record<ElectrodeName, HistorySample[]>;
  speed: number;
  isPaused: boolean;
  togglePlayPause: () => void;
  selectedChannel: ElectrodeName | null;
  selectChannel: (name: ElectrodeName) => void;
  setSpeed: (speed: number) => void;
  startDemo: () => void;
  startLive: () => void;
  disconnect: () => void;
  selectTrial: (index: number, startOffset?: number) => void;
  audioError: boolean;
}

export function usePlaybackEngine(): PlaybackEngine {
  const [mode, setMode] = useState<AppMode>({ kind: "idle" });
  const [selectedChannel, setSelectedChannel] = useState<ElectrodeName | null>("Cz");
  const [frame, setFrame] = useState<Frame>(INITIAL_FRAME);
  const [histories, setHistories] = useState<Record<ElectrodeName, HistorySample[]>>(() => {
    const initial: Partial<Record<ElectrodeName, HistorySample[]>> = {};
    ELECTRODE_NAMES.forEach((name) => {
      initial[name] = [];
    });
    return initial as Record<ElectrodeName, HistorySample[]>;
  });
  const [speed, setSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<boolean>(false);

  const timeRef = useRef<number>(0);
  const sourceRef = useRef<SignalSource>(idleSignalSource);
  const cancelConnectionRef = useRef<() => void>(() => {});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioHasErrorRef = useRef<boolean>(false);

  // Swap the active SignalSource whenever the mode changes, and restart the
  // elapsed-time clock so playback always begins from trial 0 / baseline.
  useEffect(() => {
    timeRef.current = 0;
    setSpeed(1);
    setIsPaused(false);
    setHistories(() => {
      const initial: Partial<Record<ElectrodeName, HistorySample[]>> = {};
      ELECTRODE_NAMES.forEach((name) => {
        initial[name] = [];
      });
      return initial as Record<ElectrodeName, HistorySample[]>;
    });

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
    if (isPaused) return;

    const timer = setInterval(() => {
      timeRef.current += (FRAME_INTERVAL_MS / 1000) * speed;
      const nextFrame = sourceRef.current.getFrame(timeRef.current);
      setFrame(nextFrame);

      setHistories((prev) => {
        const next = { ...prev };
        const isBaseline = nextFrame.phase === "baseline";
        ELECTRODE_NAMES.forEach((name) => {
          const val = nextFrame.channels[name]?.value ?? 0;
          const prevChan = prev[name] || [];
          const chanHistory = [...prevChan, { value: val, isBaseline }];
          if (chanHistory.length > HISTORY_LIMIT) {
            chanHistory.shift();
          }
          next[name] = chanHistory;
        });
        return next;
      });
    }, FRAME_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [speed, isPaused]);

  // Sync audio playback with demo trials
  useEffect(() => {
    if (mode.kind !== "demo") {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      audioHasErrorRef.current = false;
      setAudioError(false);
      return;
    }

    if (frame.trialIndex === undefined) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    const trialNumStr = String(frame.trialIndex + 1).padStart(2, "0");
    const expectedSrc = `/audio/video-${trialNumStr}.m4a`;

    if (!audioRef.current) {
      audioRef.current = new Audio(expectedSrc);
      audioHasErrorRef.current = false;
      setAudioError(false);
    } else if (audioRef.current.src && !audioRef.current.src.endsWith(expectedSrc)) {
      audioRef.current.pause();
      audioRef.current.src = expectedSrc;
      audioHasErrorRef.current = false;
      setAudioError(false);
      audioRef.current.load();
    }

    const audio = audioRef.current;

    // Monitor loading errors
    audio.onerror = () => {
      audioHasErrorRef.current = true;
      setAudioError(true);
      audio.pause();
    };

    // Handle speed/playback rate & muting
    audio.playbackRate = speed;
    audio.muted = speed === 10;

    if (frame.phase === "stimulus") {
      const targetTime = (frame.trialElapsed ?? 3) - 3;
      
      // Sync time if drifted too far (and audio is ready)
      if (audio.readyState >= 1 && Math.abs(audio.currentTime - targetTime) > 0.3) {
        audio.currentTime = targetTime;
      }

      if (isPaused || audioHasErrorRef.current) {
        if (!audio.paused) {
          audio.pause();
        }
      } else {
        if (audio.paused) {
          audio.play().catch((err) => {
            console.log("Audio autoplay / play failed or was blocked by browser:", err);
          });
        }
      }
    } else {
      // Baseline or other non-stimulus phase: pause and keep playhead at beginning
      if (!audio.paused) {
        audio.pause();
      }
      if (audio.currentTime !== 0) {
        audio.currentTime = 0;
      }
    }
  }, [mode.kind, isPaused, speed, frame.trialIndex, frame.phase, frame.trialElapsed]);

  // Cancel any pending mock-connection timers on unmount.
  useEffect(() => () => cancelConnectionRef.current(), []);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const selectTrial = useCallback((index: number, startOffset = 0) => {
    timeRef.current = index * TRIAL_SECONDS + startOffset;
    setHistories(() => {
      const initial: Partial<Record<ElectrodeName, HistorySample[]>> = {};
      ELECTRODE_NAMES.forEach((name) => {
        initial[name] = [];
      });
      return initial as Record<ElectrodeName, HistorySample[]>;
    });
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

  const togglePlayPause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  return {
    mode,
    frame,
    history: (histories[selectedChannel || "Cz"] || []).map((s) => s.value),
    histories,
    speed,
    isPaused,
    togglePlayPause,
    selectedChannel,
    selectChannel: setSelectedChannel,
    setSpeed,
    startDemo,
    startLive,
    disconnect,
    selectTrial,
    audioError,
  };
}
