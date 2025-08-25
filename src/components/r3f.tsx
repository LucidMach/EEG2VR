import * as THREE from "three";
import React, { useRef, useState } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import EEGHead from "./eegHead";
import { OrbitControls } from "@react-three/drei";

function Box(props: ThreeElements["mesh"]) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // useFrame((state, delta) => (meshRef.current.rotation.x += delta));
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 0.25}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      {/* <boxGeometry args={[1, 1, 1]} /> */}
      <sphereGeometry args={[1, 80, 80]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "#2f74c0"} />
    </mesh>
  );
}

const R3F: React.FC = () => {
  return (
    <Canvas
      className="w-full h-full"
      shadows
      camera={{ position: [0, 0, 10], fov: 50 }}
    >
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <EEGHead
        position={[0.085, -0.075, 0]}
        rotation={[0, Math.PI / 2, Math.PI / 4]}
        scale={Math.PI / 2}
      />
      {/* <Model /> */}
      {/* <Box position={[-1, 0, 0]} /> */}
      {/* <Box position={[0, 0, 0]} /> */}
      {/* <Box position={[1, 0, 0]} /> */}
      <OrbitControls />
    </Canvas>
  );
};

export default R3F;
