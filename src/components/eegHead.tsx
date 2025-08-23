import * as THREE from "three";
import React, { useRef, type JSX } from "react";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    HemiSphere: THREE.Mesh;
    Sphere: THREE.Mesh;
    Sphere001: THREE.Mesh;
    Sphere002: THREE.Mesh;
    Sphere003: THREE.Mesh;
    Sphere004: THREE.Mesh;
    Sphere005: THREE.Mesh;
    Sphere006: THREE.Mesh;
    Sphere007: THREE.Mesh;
    Sphere008: THREE.Mesh;
    Sphere009: THREE.Mesh;
    Sphere010: THREE.Mesh;
    Sphere011: THREE.Mesh;
    Sphere012: THREE.Mesh;
    Sphere013: THREE.Mesh;
    Sphere014: THREE.Mesh;
    Sphere015: THREE.Mesh;
    Sphere016: THREE.Mesh;
    Sphere017: THREE.Mesh;
    Sphere018: THREE.Mesh;
  };
  materials: {
    Plasma: THREE.MeshPhysicalMaterial;
    MattBlack: THREE.MeshStandardMaterial;
  };
};

const EEGHead: React.FC<JSX.IntrinsicElements["group"]> = (props) => {
  const { nodes, materials } = useGLTF(
    "src/assets/EEG-Positioning-System.glb"
  ) as unknown as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <mesh
        name="HemiSphere"
        castShadow
        receiveShadow
        geometry={nodes.HemiSphere.geometry}
        material={materials.Plasma}
        position={[0.007, 0.017, 0.009]}
        scale={1.557}
        userData={{ name: "HemiSphere" }}
      />
      <mesh
        name="Cz"
        castShadow
        receiveShadow
        geometry={nodes.Sphere.geometry}
        material={materials.MattBlack}
        position={[1.45, 0.017, 0.009]}
        scale={0.205}
        userData={{ name: "Cz" }}
      />
      <mesh
        name="C3"
        castShadow
        receiveShadow
        geometry={nodes.Sphere001.geometry}
        material={materials.MattBlack}
        position={[1.231, 0.017, -0.753]}
        rotation={[0, 0.554, 0]}
        scale={0.205}
        userData={{ name: "C3" }}
      />
      <mesh
        name="C4"
        castShadow
        receiveShadow
        geometry={nodes.Sphere002.geometry}
        material={materials.MattBlack}
        position={[1.203, 0.017, 0.77]}
        rotation={[0, -0.59, 0]}
        scale={0.205}
        userData={{ name: "C4" }}
      />
      <mesh
        name="T4"
        castShadow
        receiveShadow
        geometry={nodes.Sphere003.geometry}
        material={materials.MattBlack}
        position={[0.216, 0.017, 1.517]}
        rotation={[-0.182, -1.436, -0.186]}
        scale={0.205}
        userData={{ name: "T4" }}
      />
      <mesh
        name="T3"
        castShadow
        receiveShadow
        geometry={nodes.Sphere004.geometry}
        material={materials.MattBlack}
        position={[0.21, 0.017, -1.51]}
        rotation={[-0.266, 1.426, 0.251]}
        scale={0.205}
        userData={{ name: "T3" }}
      />
      <mesh
        name="F4"
        castShadow
        receiveShadow
        geometry={nodes.Sphere005.geometry}
        material={materials.MattBlack}
        position={[1.036, 0.794, 0.621]}
        rotation={[0, -0.59, 0]}
        scale={0.205}
        userData={{ name: "F4" }}
      />
      <mesh
        name="F3"
        castShadow
        receiveShadow
        geometry={nodes.Sphere006.geometry}
        material={materials.MattBlack}
        position={[1.055, 0.794, -0.625]}
        rotation={[0, 0.554, 0]}
        scale={0.205}
        userData={{ name: "F3" }}
      />
      <mesh
        name="Fz"
        castShadow
        receiveShadow
        geometry={nodes.Sphere007.geometry}
        material={materials.MattBlack}
        position={[1.217, 0.794, 0.009]}
        scale={0.205}
        userData={{ name: "Fz" }}
      />
      <mesh
        name="Pz"
        castShadow
        receiveShadow
        geometry={nodes.Sphere008.geometry}
        material={materials.MattBlack}
        position={[1.234, -0.751, 0.009]}
        scale={0.205}
        userData={{ name: "Pz" }}
      />
      <mesh
        name="P3"
        castShadow
        receiveShadow
        geometry={nodes.Sphere009.geometry}
        material={materials.MattBlack}
        position={[1.066, -0.751, -0.634]}
        rotation={[0, 0.554, 0]}
        scale={0.205}
        userData={{ name: "P3" }}
      />
      <mesh
        name="P4"
        castShadow
        receiveShadow
        geometry={nodes.Sphere010.geometry}
        material={materials.MattBlack}
        position={[1.067, -0.751, 0.644]}
        rotation={[0, -0.59, 0]}
        scale={0.205}
        userData={{ name: "P4" }}
      />
      <mesh
        name="F7"
        castShadow
        receiveShadow
        geometry={nodes.Sphere011.geometry}
        material={materials.MattBlack}
        position={[0.209, 0.911, -1.244]}
        rotation={[0.838, 1.41, -0.202]}
        scale={0.205}
        userData={{ name: "F7" }}
      />
      <mesh
        name="F8"
        castShadow
        receiveShadow
        geometry={nodes.Sphere012.geometry}
        material={materials.MattBlack}
        position={[0.21, 0.911, 1.242]}
        rotation={[-0.936, -1.43, -0.265]}
        scale={0.205}
        userData={{ name: "F8" }}
      />
      <mesh
        name="T6"
        castShadow
        receiveShadow
        geometry={nodes.Sphere013.geometry}
        material={materials.MattBlack}
        position={[0.21, -0.869, 1.242]}
        rotation={[0.579, -1.55, -0.062]}
        scale={0.205}
        userData={{ name: "T6" }}
      />
      <mesh
        name="T5"
        castShadow
        receiveShadow
        geometry={nodes.Sphere014.geometry}
        material={materials.MattBlack}
        position={[0.217, -0.854, -1.213]}
        rotation={[0.73, 1.552, -1.333]}
        scale={0.205}
        userData={{ name: "T5" }}
      />
      <mesh
        name="Sphere015"
        castShadow
        receiveShadow
        geometry={nodes.Sphere015.geometry}
        material={materials.MattBlack}
        position={[0.211, -1.42, -0.481]}
        rotation={[-1.568, 1.465, 0.284]}
        scale={0.205}
        userData={{ name: "O1" }}
      />
      <mesh
        name="O2"
        castShadow
        receiveShadow
        geometry={nodes.Sphere016.geometry}
        material={materials.MattBlack}
        position={[0.217, -1.419, 0.502]}
        rotation={[1.239, -1.551, 0]}
        scale={0.205}
        userData={{ name: "O2" }}
      />
      <mesh
        name="Fp2"
        castShadow
        receiveShadow
        geometry={nodes.Sphere017.geometry}
        material={materials.MattBlack}
        position={[0.223, 1.468, 0.486]}
        rotation={[-1.561, -1.432, -0.329]}
        scale={0.205}
        userData={{ name: "Fp2" }}
      />
      <mesh
        name="Fp1"
        castShadow
        receiveShadow
        geometry={nodes.Sphere018.geometry}
        material={materials.MattBlack}
        position={[0.222, 1.469, -0.496]}
        rotation={[1.337, 1.405, -0.146]}
        scale={0.205}
        userData={{ name: "Fp1" }}
      />
    </group>
  );
};

useGLTF.preload("/EEG-Positioning-System.glb");

export default EEGHead;
