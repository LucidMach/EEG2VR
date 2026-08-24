import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { ElectrodeName, Frame } from "../../utils/signalSource";

export interface ConsoleSnapshot {
  inVR: boolean;
  phase: Frame["phase"];
  trialIndex: number;
  valence?: number;
  arousal?: number;
  focus?: number;
  focusAvg: number;
  currentValue: number;
}

const EMPTY_SNAPSHOT: ConsoleSnapshot = {
  inVR: false,
  phase: "idle",
  trialIndex: 0,
  focusAvg: 0,
  currentValue: 0,
};

// Reads the live frame from a ref (this subtree's parent is memoized off the
// React tick) and republishes just the values the console displays into
// local state, and only while actually presenting in XR — so the 2D
// showcase path never re-renders this at all.
export function useConsoleSnapshot(
  frameRef: React.RefObject<Frame>,
  selectedChannel: ElectrodeName | null
): ConsoleSnapshot {
  const [snapshot, setSnapshot] = useState<ConsoleSnapshot>(EMPTY_SNAPSHOT);
  const sigRef = useRef<string>("");
  const lastUpdateRef = useRef<number>(0);
  const prevChannelRef = useRef<ElectrodeName | null>(null);

  useFrame((state) => {
    const inVR = state.gl.xr.isPresenting;

    if (!inVR) {
      if (sigRef.current !== "") {
        sigRef.current = "";
        setSnapshot(EMPTY_SNAPSHOT);
      }
      return;
    }

    const frame = frameRef.current;
    const currentValue =
      selectedChannel && frame.channels[selectedChannel]
        ? frame.channels[selectedChannel]!.value
        : 0;

    const next: ConsoleSnapshot = {
      inVR: true,
      phase: frame.phase,
      trialIndex: frame.trialIndex ?? 0,
      valence: frame.ratings?.valence,
      arousal: frame.ratings?.arousal,
      focus: frame.focus,
      focusAvg: frame.focus_avg ?? 0,
      currentValue,
    };

    const now = performance.now();
    const isMajorChange =
      next.phase !== snapshot.phase ||
      next.trialIndex !== snapshot.trialIndex ||
      selectedChannel !== prevChannelRef.current;

    // Throttle fast-changing telemetry text to 4 Hz so Drei <Text> does not re-layout at 90 Hz
    if (isMajorChange || now - lastUpdateRef.current >= 250) {
      const sig = `${next.phase}|${next.trialIndex}|${next.valence}|${next.arousal}|${
        next.focus === undefined ? "-" : Math.round(next.focus * 100)
      }|${Math.round(next.focusAvg * 100)}|${currentValue.toFixed(2)}|${selectedChannel ?? "-"}`;

      if (sig !== sigRef.current) {
        sigRef.current = sig;
        lastUpdateRef.current = now;
        prevChannelRef.current = selectedChannel;
        setSnapshot(next);
      }
    }
  });

  return snapshot;
}
