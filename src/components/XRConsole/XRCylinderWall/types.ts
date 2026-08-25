import type { ElectrodeName, Frame } from "../../../utils/signalSource";
import type { HistorySample } from "../../../hooks/usePlaybackEngine";

export interface CylinderRenderState {
  frame: Frame;
  histories: Record<ElectrodeName, HistorySample[]>;
  selectedChannel: ElectrodeName | null;
  hoveredChannel: ElectrodeName | null;
}

export interface CylinderChannelHitArea {
  name: ElectrodeName;
  yMin: number;
  yMax: number;
}
