import React from "react";
import type { PlaybackEngine } from "../../hooks/usePlaybackEngine";
import BackButton from "./BackButton";
import PhaseIndicator from "./PhaseIndicator";
import PlaybackControls from "./PlaybackControls";

interface TopHudBarProps {
  engine: PlaybackEngine;
}

// Top HUD nav bar: exit button (left), phase pill (center), playback
// controls (right). Hidden entirely in idle mode by the caller.
const TopHudBar: React.FC<TopHudBarProps> = ({ engine }) => (
  <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-2 pointer-events-none">
    <BackButton onClick={engine.disconnect} />
    <PhaseIndicator isDemo={engine.mode.kind === "demo"} phase={engine.frame.phase} />
    <PlaybackControls
      phase={engine.frame.phase}
      isPaused={engine.isPaused}
      speed={engine.speed}
      onTogglePlayPause={engine.togglePlayPause}
      onSetSpeed={engine.setSpeed}
    />
  </div>
);

export default TopHudBar;
