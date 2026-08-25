import type { ElectrodeName, Frame } from "../../../utils/signalSource";
import type { HistorySample } from "../../../hooks/usePlaybackEngine";

export interface DashboardRenderState {
  frame: Frame;
  histories: Record<ElectrodeName, HistorySample[]>;
  selectedChannel: ElectrodeName | null;
  speed: number;
  isPaused: boolean;
}

export interface InteractiveHitArea {
  id: string;
  type: "trial-baseline" | "trial-stimulus" | "play-pause" | "speed" | "exit-xr";
  x: number;
  y: number;
  width: number;
  height: number;
  trialIndex?: number;
  startOffset?: number;
}
