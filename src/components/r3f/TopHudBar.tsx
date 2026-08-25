import React from "react";
import type { PlaybackEngine } from "../../hooks/usePlaybackEngine";
import BackButton from "./BackButton";
import PhaseIndicator from "./PhaseIndicator";
import PlaybackControls from "./PlaybackControls";
import { xrStore } from "../../utils/xrStore";

interface TopHudBarProps {
  engine: PlaybackEngine;
}

// Top HUD nav bar: exit button (left), phase pill (center), playback
// controls (right). Hidden entirely in idle mode by the caller.
const TopHudBar: React.FC<TopHudBarProps> = ({ engine }) => (
  <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between gap-4 pointer-events-none">
    <BackButton onClick={engine.disconnect} />
    <PhaseIndicator isDemo={engine.mode.kind === "demo"} phase={engine.frame.phase} />
    <div className="flex items-center gap-3 pointer-events-auto">
      <button
        onClick={() => xrStore.enterVR()}
        className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg hover:shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer border border-indigo-400/40"
        title="Enter VR"
        aria-label="Enter VR"
      >
        <svg className="w-4 h-4 md:w-4.5 md:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M21 7H3a2 2 0 00-2 2v6a2 2 0 002 2h4l2 2h6l2-2h4a2 2 0 002-2V9a2 2 0 00-2-2zM7.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        </svg>
      </button>
      <PlaybackControls
        phase={engine.frame.phase}
        isPaused={engine.isPaused}
        speed={engine.speed}
        onTogglePlayPause={engine.togglePlayPause}
        onSetSpeed={engine.setSpeed}
      />
    </div>
  </div>
);

export default TopHudBar;
