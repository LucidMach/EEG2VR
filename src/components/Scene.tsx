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
import type { HistorySample } from "../hooks/usePlaybackEngine";

interface SceneProps {
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
  speed?: number;
  isPaused?: boolean;
  audioError?: boolean;
}

const Scene: React.FC<SceneProps> = ({
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
  speed,
  isPaused,
  audioError = false,
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
        speed={speed}
        isPaused={isPaused}
        audioError={audioError}
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
