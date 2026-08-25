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
  <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-2 pointer-events-none">
    <BackButton onClick={engine.disconnect} />
    <div className="flex items-center gap-2">
      <PhaseIndicator isDemo={engine.mode.kind === "demo"} phase={engine.frame.phase} />
      <button
        onClick={() => xrStore.enterVR()}
        className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-full shadow-md transition-all cursor-pointer"
        title="Enter Immersive WebXR Mode"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 7H3a2 2 0 00-2 2v6a2 2 0 002 2h4l2 2h6l2-2h4a2 2 0 002-2V9a2 2 0 00-2-2zM7.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        </svg>
        Enter VR
      </button>
    </div>
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
