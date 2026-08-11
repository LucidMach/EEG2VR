import { useEffect, useRef, useState } from "react";
import type { Frame } from "../../utils/signalSource";
import type { AppMode } from "../../utils/appMode";

interface Params {
  mode: AppMode;
  isPaused: boolean;
  speed: number;
  frame: Pick<Frame, "trialIndex" | "phase" | "trialElapsed">;
}

// Keeps a single <audio> element's src/playback-rate/currentTime in lockstep
// with the active demo trial and phase. Surfaces `audioError` when the
// expected /audio/video-NN.m4a asset fails to load.
export function useAudioSync({ mode, isPaused, speed, frame }: Params): boolean {
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioHasErrorRef = useRef(false);

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

    audio.onerror = () => {
      audioHasErrorRef.current = true;
      setAudioError(true);
      audio.pause();
    };

    audio.playbackRate = speed;
    audio.muted = speed === 10;

    if (frame.phase === "stimulus") {
      const targetTime = (frame.trialElapsed ?? 3) - 3;

      if (audio.readyState >= 1 && Math.abs(audio.currentTime - targetTime) > 0.3) {
        audio.currentTime = targetTime;
      }

      if (isPaused || audioHasErrorRef.current) {
        if (!audio.paused) audio.pause();
      } else if (audio.paused) {
        audio.play().catch((err) => {
          console.log("Audio autoplay / play failed or was blocked by browser:", err);
        });
      }
    } else {
      // Baseline or other non-stimulus phase: pause and keep playhead at beginning
      if (!audio.paused) audio.pause();
      if (audio.currentTime !== 0) audio.currentTime = 0;
    }
  }, [mode.kind, isPaused, speed, frame.trialIndex, frame.phase, frame.trialElapsed]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return audioError;
}
