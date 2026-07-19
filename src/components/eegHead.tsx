import * as THREE from "three";
import React, { useRef, forwardRef, type JSX } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { GLTF } from "three-stdlib";
import type { ElectrodeName, Frame } from "../utils/signalSource";
import { computeElectrodeVisualState } from "../utils/electrodeVisualState";

type GLTFResult = GLTF & {
  nodes: {
    HemiSphereF7: THREE.Mesh;
    HemiSphereC3: THREE.Mesh;
    HemiSphereC4: THREE.Mesh;
    HemiSphereCz: THREE.Mesh;
    HemiSphereF3: THREE.Mesh;
    HemiSphereF4: THREE.Mesh;
    HemiSphereF8: THREE.Mesh;
    HemiSphereFp1: THREE.Mesh;
    HemiSphereFp2: THREE.Mesh;
    HemiSphereFpZ: THREE.Mesh;
    HemiSphereFz: THREE.Mesh;
    HemiSphereO1: THREE.Mesh;
    HemiSphereO2: THREE.Mesh;
    HemiSphereOz: THREE.Mesh;
    HemiSphereP3: THREE.Mesh;
    HemiSphereP4: THREE.Mesh;
    HemiSpherePz: THREE.Mesh;
    HemiSphereT3: THREE.Mesh;
    HemiSphereT4: THREE.Mesh;
    HemiSphereT5: THREE.Mesh;
    HemiSphereT6: THREE.Mesh;
    Modular_Headset: THREE.Mesh;
  };
  materials: {
    ['Plasma.F7']: THREE.MeshPhysicalMaterial;
    ['Plasma.C3']: THREE.MeshPhysicalMaterial;
    ['Plasma.C4']: THREE.MeshPhysicalMaterial;
    ['Plasma.Cz']: THREE.MeshPhysicalMaterial;
    ['Plasma.F3']: THREE.MeshPhysicalMaterial;
    ['Plasma.F4']: THREE.MeshPhysicalMaterial;
    ['Plasma.F8']: THREE.MeshPhysicalMaterial;
    ['Plasma.Fp1']: THREE.MeshPhysicalMaterial;
    ['Plasma.Fp2']: THREE.MeshPhysicalMaterial;
    ['Plasma.FpZ']: THREE.MeshPhysicalMaterial;
    ['Plasma.Fz']: THREE.MeshPhysicalMaterial;
    ['Plasma.O1']: THREE.MeshPhysicalMaterial;
    ['Plasma.O2']: THREE.MeshPhysicalMaterial;
    ['Plasma.Oz']: THREE.MeshPhysicalMaterial;
    ['Plasma.P3']: THREE.MeshPhysicalMaterial;
    ['Plasma.P4']: THREE.MeshPhysicalMaterial;
    ['Plasma.Pz']: THREE.MeshPhysicalMaterial;
    ['Plasma.T3']: THREE.MeshPhysicalMaterial;
    ['Plasma.T4']: THREE.MeshPhysicalMaterial;
    ['Plasma.T5']: THREE.MeshPhysicalMaterial;
    ['Plasma.T6']: THREE.MeshPhysicalMaterial;
    MattBlack: THREE.MeshStandardMaterial;
  };
};

interface EEGHeadProps extends React.ComponentPropsWithoutRef<"group"> {
  frame: Frame;
  selectedChannel?: ElectrodeName | null;
  onChannelSelect?: (channelName: ElectrodeName) => void;
}

const EEGHead = forwardRef<THREE.Group, EEGHeadProps>(
  (
    {
      frame,
      selectedChannel,
      onChannelSelect,
      ...props
    },
    ref
  ) => {
    const { nodes, materials } = useGLTF("/digitalTwin.glb") as unknown as GLTFResult;
    const meshRefs = useRef<Record<string, THREE.Mesh>>({});

    useFrame((state) => {
      const time = state.clock.getElapsedTime();

      Object.entries(meshRefs.current).forEach(([chName, mesh]) => {
        if (!mesh) return;

        const material = mesh.material as THREE.MeshStandardMaterial;
        if (!material) return;

        const target = computeElectrodeVisualState(frame, chName as ElectrodeName, time);

        // Smoothly lerp color, intensity, and opacity
        material.color.lerp(target.color, 0.2);
        material.emissive.lerp(target.color, 0.2);
        material.emissiveIntensity = THREE.MathUtils.lerp(
          material.emissiveIntensity,
          target.intensity,
          0.2
        );
        material.opacity = THREE.MathUtils.lerp(
          material.opacity,
          target.opacity,
          0.2
        );
      });
    });

    // Helper to render interactive LED nodes
    const renderNode = (
      name: ElectrodeName,
      nodeMesh: THREE.Mesh,
      pos: [number, number, number],
      rot: [number, number, number]
    ) => {
      return (
        <mesh
          key={name}
          ref={(el) => {
            if (el) meshRefs.current[name] = el;
          }}
          castShadow
          receiveShadow
          geometry={nodeMesh.geometry}
          position={pos}
          rotation={rot}
          scale={2.1} // Apply the selected scale style (larger) to all sensors
          onClick={(e) => {
            e.stopPropagation();
            onChannelSelect?.(name);
          }}
        >
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.15}
            metalness={0.1}
            emissive={new THREE.Color("#000000")}
            emissiveIntensity={0.0}
            transparent
            opacity={0.8}
          />
        </mesh>
      );
    };

    return (
      <group ref={ref} {...props} dispose={null}>
        {renderNode("F7", nodes.HemiSphereF7, [13.994, 2.857, 10.273], [-0.194, -0.475, -0.011])}
        {renderNode("C3", nodes.HemiSphereC3, [12.638, 15.844, 0.075], [1.329, 0.742, 0.11])}
        {renderNode("C4", nodes.HemiSphereC4, [-12.773, 15.844, 0.075], [-1.332, 0.75, 3.029])}
        {renderNode("Cz", nodes.HemiSphereCz, [-0.108, 21.728, 0.075], [0.229, 1.392, 1.385])}
        {renderNode("F3", nodes.HemiSphereF3, [9.679, 12.446, 12.046], [-1.958, -0.369, -0.731])}
        {renderNode("F4", nodes.HemiSphereF4, [-10.432, 11.898, 12.256], [-1.973, 0.472, -2.266])}
        {renderNode("F8", nodes.HemiSphereF8, [-14.666, 2.922, 10.539], [-2.954, -0.4, -2.989])}
        {renderNode("Fp1", nodes.HemiSphereFp1, [6.489, 3.009, 19.009], [-0.411, -1.126, -0.296])}
        {renderNode("Fp2", nodes.HemiSphereFp2, [-6.589, 2.784, 18.973], [-2.78, -1.063, -2.744])}
        {renderNode("FpZ", nodes.HemiSphereFpZ, [-0.048, 3.088, 20.266], [-1.919, -1.387, -1.845])}
        {renderNode("Fz", nodes.HemiSphereFz, [-0.027, 16.662, 13.312], [0.803, 1.392, 1.385])}
        {renderNode("O1", nodes.HemiSphereO1, [5.96, 3.164, -18.826], [-0.417, 1.132, 0.46])}
        {renderNode("O2", nodes.HemiSphereO2, [-6.208, 3.012, -18.902], [-2.742, 1.113, 2.859])}
        {renderNode("Oz", nodes.HemiSphereOz, [-0.124, 3.012, -20.119], [-1.31, 1.392, 1.385])}
        {renderNode("P3", nodes.HemiSphereP3, [10.905, 12.446, -13.202], [-1.233, -0.415, 0.834])}
        {renderNode("P4", nodes.HemiSphereP4, [-10.339, 12.446, -12.793], [-1.161, 0.344, 2.347])}
        {renderNode("Pz", nodes.HemiSpherePz, [-0.108, 16.662, -14.305], [-0.602, 1.392, 1.385])}
        {renderNode("T3", nodes.HemiSphereT3, [16.912, 2.708, -0.193], [-0.173, -0.038, 0.073])}
        {renderNode("T4", nodes.HemiSphereT4, [-16.932, 2.708, 0.035], [-2.969, 0.019, -3.066])}
        {renderNode("T5", nodes.HemiSphereT5, [14.706, 2.708, -10.917], [-0.189, 0.422, 0.158])}
        {renderNode("T6", nodes.HemiSphereT6, [-14.726, 2.708, -10.917], [-2.938, 0.559, 3.112])}

        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Modular_Headset.geometry}
          material={materials.MattBlack}
          scale={0.161}
        />
      </group>
    );
  }
);

EEGHead.displayName = "EEGHead";

useGLTF.preload("/digitalTwin.glb");

export default EEGHead;
