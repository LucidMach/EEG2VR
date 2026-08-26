import * as THREE from "three";
import React, { useRef } from "react";
import { useThree } from "@react-three/fiber";
import EEGHead from "../eegHead";
import XRConsole from "../XRConsole";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import type { HistorySample } from "../../hooks/usePlaybackEngine";
import { useXRDragInteraction } from "./useXRDragInteraction";
import { useHeadPlacement } from "./useHeadPlacement";
import { resolveHeadPosition } from "./spatialCollision";

interface HeadWrapperProps {
  frameRef: React.RefObject<Frame>;
  historiesRef?: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  selectedChannel: ElectrodeName | null;
  hoveredChannel?: ElectrodeName | null;
  onChannelSelect: (name: ElectrodeName) => void;
  onChannelHover?: (name: ElectrodeName | null) => void;
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
  hoveredChannel,
  onChannelSelect,
  onChannelHover,
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

  const panelPositionRef = useRef(new THREE.Vector3(0, 0.82, -1.05));
  const panelRotationRef = useRef(
    new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 6, 0, 0))
  );

  const { isDraggingRef, xrPositionRef, xrRotationRef, handlePointerDown, handlePointerMove, handlePointerUp } =
    useXRDragInteraction({
      gl,
      groupRef,
      initialPosition: [0, 1.3, -1.1],
      initialRotation: [0, 0, 0],
      constrainPosition: (targetPos, targetQuat) => {
        resolveHeadPosition(targetPos, targetQuat, panelPositionRef.current, panelRotationRef.current);
      },
    });

  useHeadPlacement({
    groupRef,
    frameRef,
    isDraggingRef,
    xrPositionRef,
    xrRotationRef,
    selectedChannel,
  });

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
          hoveredChannel={hoveredChannel}
          onChannelSelect={onChannelSelect}
          onChannelHover={onChannelHover}
        />
      </group>
      {/* Render 3D Spatial Dashboard in WebXR Mode only */}
      <XRConsole
        frameRef={frameRef}
        historiesRef={historiesRef}
        selectedChannel={selectedChannel}
        hoveredChannel={hoveredChannel}
        onChannelSelect={onChannelSelect}
        onChannelHover={onChannelHover}
        onStartDemo={onStartDemo}
        onStartLive={onStartLive}
        onTrialSelect={onTrialSelect}
        onTogglePlayPause={onTogglePlayPause}
        onSetSpeed={onSetSpeed}
        onExitXR={handleExitXR}
        speed={speed}
        isPaused={isPaused}
        audioError={audioError}
        headPositionRef={xrPositionRef}
        headRotationRef={xrRotationRef}
        panelPositionRef={panelPositionRef}
        panelRotationRef={panelRotationRef}
      />
    </group>
  );
};

export default HeadWrapper;

