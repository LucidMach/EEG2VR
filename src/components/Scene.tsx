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
import type { PlaybackEngine } from "../hooks/usePlaybackEngine";

interface SceneProps {
  engine: PlaybackEngine;
}

const Scene: React.FC<SceneProps> = ({ engine }) => (
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
      <HeadWrapper engine={engine} />
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
