import type { RefObject } from "react";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import type { AppMode } from "../../utils/appMode";
import type { Histories } from "./history";

export interface PlaybackEngine {
  mode: AppMode;
  frame: Frame; // DOM-facing snapshot; updated at the 20 Hz tick for the HUD
  frameRef: RefObject<Frame>; // live frame for the render loop (no re-render)
  historiesRef: RefObject<Histories>; // rolling per-electrode ring buffers
  speed: number;
  isPaused: boolean;
  isLoading: boolean;
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
