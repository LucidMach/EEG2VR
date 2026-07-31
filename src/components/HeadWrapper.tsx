// Dynamically adapts the digital twin's position/scale/rotation for 2D vs.
// WebXR presentation, and hosts the floating XR console alongside it.
//
// Frame data arrives via a ref so this subtree can be memoized upstream and
// stay off the 20 Hz React re-render path — the useFrame loop reads the latest
// frame each three.js frame.
import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import EEGHead from "./eegHead";
import XRConsole from "./XRConsole";
import type { ElectrodeName, Frame } from "../utils/signalSource";

interface HeadWrapperProps {
  frameRef: React.RefObject<Frame>;
  selectedChannel: ElectrodeName | null;
  onChannelSelect: (name: ElectrodeName) => void;
}

const HeadWrapper: React.FC<HeadWrapperProps> = ({ frameRef, selectedChannel, onChannelSelect }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const isPresenting = state.gl.xr.isPresenting;
    const isIdleShowcase = frameRef.current.phase === "idle";

    if (groupRef.current) {
      if (isPresenting) {
        // --- WebXR VR/AR Presentation Layout ---
        // Position at eye level, roughly 1.1 meters in front of the camera
        groupRef.current.position.set(0, 1.3, -1.1);

        // Map the user's XR headset's rotation to the digital twin headset rotation!
        groupRef.current.quaternion.copy(state.camera.quaternion);

        // Scale to a realistic physical head size (approx 22cm diameter)
        groupRef.current.scale.setScalar(0.012);
      } else {
        // --- Standard 2D Desktop Layout ---
        // Dynamically scale model to occupy exactly 1/3 of the viewport height
        // Model height is approx 22 units in Blender local space.
        const targetScale = state.viewport.height / 66;

        if (isIdleShowcase) {
          // Slow showcase spin in idle mode
          groupRef.current.rotation.y = time * 0.15;
          groupRef.current.rotation.x = Math.sin(time * 0.4) * 0.05 + Math.PI / 32;

          // Subtle bobbing motion
          groupRef.current.position.set(0, -11 * targetScale - Math.cos(time * 1.2) * 0.2, 0);
          groupRef.current.scale.setScalar(targetScale * 1.1);
        } else {
          groupRef.current.scale.setScalar(targetScale);
          groupRef.current.position.set(0, -11 * targetScale, 0);
          groupRef.current.rotation.y = 0;
          groupRef.current.rotation.x = Math.PI / 32;
        }
      }
    }
  });

  return (
    <group>
      <EEGHead
        ref={groupRef}
        frameRef={frameRef}
        selectedChannel={selectedChannel}
        onChannelSelect={onChannelSelect}
        rotation={[Math.PI / 32, 0, 0]}
      />
      {/* Render 3D Floating Console in WebXR Mode only */}
      <XRConsole frameRef={frameRef} selectedChannel={selectedChannel} />
    </group>
  );
};

export default HeadWrapper;
