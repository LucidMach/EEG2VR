// Dynamically adapts the digital twin's position/scale/rotation for 2D vs.
// WebXR presentation, and hosts the floating XR console alongside it.
//
// Frame data arrives via a ref so this subtree can be memoized upstream and
// stay off the 20 Hz React re-render path — useHeadPlacement's useFrame loop
// reads the latest frame each three.js frame.
import * as THREE from "three";
import React, { useRef } from "react";
import { useThree } from "@react-three/fiber";
import EEGHead from "../eegHead";
import XRConsole from "../XRConsole";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import type { HistorySample } from "../../hooks/usePlaybackEngine";
import { useXRDragInteraction } from "./useXRDragInteraction";
import { useHeadPlacement } from "./useHeadPlacement";

interface HeadWrapperProps {
  frameRef: React.RefObject<Frame>;
  historiesRef?: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  selectedChannel: ElectrodeName | null;
  onChannelSelect: (name: ElectrodeName) => void;
  onStartDemo?: () => void;
  onStartLive?: () => void;
  onTrialSelect?: (index: number, startOffset?: number) => void;
  onTogglePlayPause?: () => void;
  onSetSpeed?: (speed: number) => void;
  onExitXR?: () => void;
  speed?: number;
  isPaused?: boolean;
  audioError?: boolean;
}

const HeadWrapper: React.FC<HeadWrapperProps> = ({
  frameRef,
  historiesRef,
  selectedChannel,
  onChannelSelect,
  onStartDemo,
  onStartLive,
  onTrialSelect,
  onTogglePlayPause,
  onSetSpeed,
  onExitXR,
  speed = 1,
  isPaused = false,
  audioError = false,
}) => {
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  const { isDraggingRef, xrPositionRef, xrRotationRef, handlePointerDown, handlePointerMove, handlePointerUp } =
    useXRDragInteraction({ gl, groupRef });

  useHeadPlacement({ groupRef, frameRef, isDraggingRef, xrPositionRef, xrRotationRef });

  const handleExitXR = () => {
    onExitXR?.() || gl.xr.getSession()?.end();
  };

  return (
    <group>
      <group
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <EEGHead
          ref={groupRef}
          frameRef={frameRef}
          selectedChannel={selectedChannel}
          onChannelSelect={onChannelSelect}
          rotation={[Math.PI / 32, 0, 0]}
        />
      </group>
      {/* Render 3D Spatial Dashboard in WebXR Mode only */}
      <XRConsole
        frameRef={frameRef}
        historiesRef={historiesRef}
        selectedChannel={selectedChannel}
        onChannelSelect={onChannelSelect}
        onStartDemo={onStartDemo}
        onStartLive={onStartLive}
        onTrialSelect={onTrialSelect}
        onTogglePlayPause={onTogglePlayPause}
        onSetSpeed={onSetSpeed}
        onExitXR={handleExitXR}
        speed={speed}
        isPaused={isPaused}
        audioError={audioError}
      />
    </group>
  );
};

export default HeadWrapper;
