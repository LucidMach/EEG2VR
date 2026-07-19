// 3D scene composition: Canvas, lighting rig, WebXR wrapper, orbit controls,
// and the digital twin itself.
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { XR } from "@react-three/xr";
import HeadWrapper from "./HeadWrapper";
import { xrStore } from "../utils/xrStore";
import type { ElectrodeName, Frame } from "../utils/signalSource";

interface SceneProps {
  frame: Frame;
  selectedChannel: ElectrodeName | null;
  onChannelSelect: (name: ElectrodeName) => void;
  isIdle: boolean;
}

const Scene: React.FC<SceneProps> = ({ frame, selectedChannel, onChannelSelect, isIdle }) => (
  <Canvas
    shadows
    camera={{ position: [0, 0, 7.5], fov: 45 }}
    style={{ background: isIdle ? "transparent" : "white" }}
    gl={{ alpha: true }}
  >
    {/* White solid environment background when not idle */}
    {!isIdle && <color attach="background" args={["#ffffff"]} />}

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
      <HeadWrapper frame={frame} selectedChannel={selectedChannel} onChannelSelect={onChannelSelect} />
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

export default Scene;
