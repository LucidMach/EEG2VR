// 3D scene composition: Canvas, lighting rig, WebXR wrapper, orbit controls,
// and the digital twin itself.
//
// Reads the live frame through a ref and is wrapped in React.memo: the 20 Hz
// playback tick updates the HUD via state without re-rendering (and having
// three.js reconcile) this whole subtree. The head animates off its own
// useFrame loop reading frameRef.current.
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { XR } from "@react-three/xr";
import HeadWrapper from "./HeadWrapper";
import { xrStore } from "../utils/xrStore";
import type { ElectrodeName, Frame } from "../utils/signalSource";
import type { AppMode } from "../utils/appMode";

interface SceneProps {
  frameRef: React.RefObject<Frame>;
  selectedChannel: ElectrodeName | null;
  onChannelSelect: (name: ElectrodeName) => void;
  mode: AppMode;
  isPaused: boolean;
  speed: number;
  togglePlayPause: () => void;
  setSpeed: (speed: number) => void;
  startDemo: () => void;
  startLive: () => void;
  disconnect: () => void;
  selectTrial: (index: number) => void;
}

const Scene: React.FC<SceneProps> = ({
  frameRef,
  selectedChannel,
  onChannelSelect,
  mode,
  isPaused,
  speed,
  togglePlayPause,
  setSpeed,
  startDemo,
  startLive,
  disconnect,
  selectTrial,
}) => (
  <Canvas
    shadows
    camera={{ position: [0, 0, 7.5], fov: 45 }}
    style={{ background: "transparent" }}
    gl={{ alpha: true }}
  >

    <ambientLight intensity={Math.PI / 1.5} />
    <directionalLight
      position={[5, 10, 5]}
      intensity={Math.PI}
      castShadow
      shadow-mapSize={[1024, 1024]}
    />
    <pointLight position={[-10, 10, -5]} intensity={Math.PI / 2} />
    <pointLight position={[0, -10, 0]} intensity={Math.PI / 2} />

    <XR store={xrStore}>
      <HeadWrapper
        frameRef={frameRef}
        selectedChannel={selectedChannel}
        onChannelSelect={onChannelSelect}
        mode={mode}
        isPaused={isPaused}
        speed={speed}
        togglePlayPause={togglePlayPause}
        setSpeed={setSpeed}
        startDemo={startDemo}
        startLive={startLive}
        disconnect={disconnect}
        selectTrial={selectTrial}
      />
    </XR>

    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={20}
      makeDefault
    />
  </Canvas>
);

export default React.memo(Scene);
