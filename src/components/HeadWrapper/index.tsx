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
import { useXRDragInteraction } from "./useXRDragInteraction";
import { useHeadPlacement } from "./useHeadPlacement";

interface HeadWrapperProps {
  frameRef: React.RefObject<Frame>;
  selectedChannel: ElectrodeName | null;
  onChannelSelect: (name: ElectrodeName) => void;
}

const HeadWrapper: React.FC<HeadWrapperProps> = ({ frameRef, selectedChannel, onChannelSelect }) => {
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  const { isDraggingRef, xrPositionRef, xrRotationRef, handlePointerDown, handlePointerMove, handlePointerUp } =
    useXRDragInteraction({ gl, groupRef });

  useHeadPlacement({ groupRef, frameRef, isDraggingRef, xrPositionRef, xrRotationRef });

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
      {/* Render 3D Floating Console in WebXR Mode only */}
      <XRConsole frameRef={frameRef} selectedChannel={selectedChannel} />
    </group>
  );
};

export default HeadWrapper;
