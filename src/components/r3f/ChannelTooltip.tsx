import React from "react";
import type { ElectrodeName, Frame } from "../../utils/signalSource";

interface ChannelTooltipProps {
  channel: ElectrodeName;
  frame: Frame;
}

// Hover HUD showing a single electrode's live value/impedance/quality.
const ChannelTooltip: React.FC<ChannelTooltipProps> = ({ channel, frame }) => (
  <div className="absolute top-20 left-4 z-20 bg-slate-900/90 text-white rounded-lg p-3 shadow-lg pointer-events-none text-xs flex flex-col gap-1 border border-slate-700">
    <span className="font-bold text-sm text-indigo-400">{channel} Electrode</span>
    <span>Value: {(frame.channels[channel]?.value ?? 0).toFixed(2)} µV</span>
    {frame.channels[channel]?.impedance !== undefined && (
      <span>Impedance: {frame.channels[channel]!.impedance!.toFixed(1)} kΩ</span>
    )}
    {frame.channels[channel]?.quality && (
      <span className="capitalize">Quality: {frame.channels[channel]?.quality}</span>
    )}
  </div>
);

export default ChannelTooltip;
