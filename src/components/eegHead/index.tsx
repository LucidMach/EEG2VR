import * as THREE from "three";
import React, { useRef, forwardRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ElectrodeName, Frame } from "../../utils/signalSource";
import { computeElectrodeVisualState } from "../../utils/electrodeVisualState";
import type { GLTFResult } from "./gltfTypes";
import { ELECTRODE_NODE_PLACEMENTS } from "./electrodeNodes";
import ElectrodeNode from "./ElectrodeNode";

interface EEGHeadProps extends React.ComponentPropsWithoutRef<"group"> {
  frameRef: React.RefObject<Frame>;
  selectedChannel?: ElectrodeName | null;
  hoveredChannel?: ElectrodeName | null;
  onChannelSelect?: (channelName: ElectrodeName) => void;
  onChannelHover?: (channelName: ElectrodeName | null) => void;
}

const BLACK_COLOR = new THREE.Color(0x000000);

const EEGHead = forwardRef<THREE.Group, EEGHeadProps>(
  ({ frameRef, selectedChannel, hoveredChannel, onChannelSelect, onChannelHover, ...props }, ref) => {
    const { nodes, materials } = useGLTF("/digitalTwin.glb") as unknown as GLTFResult;
    const meshRefs = useRef<Record<string, THREE.Mesh>>({});

    useFrame((state) => {
      const time = state.clock.getElapsedTime();
      const frame = frameRef.current;
      const meshes = meshRefs.current;

      for (const chName in meshes) {
        const mesh = meshes[chName];
        if (!mesh) continue;
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (!material) continue;

        // Smoothly lerp color, intensity, and opacity toward the target state.
        const target = computeElectrodeVisualState(frame, chName as ElectrodeName, time);
        material.color.lerp(target.color, 0.2);
        material.emissive.lerp(target.intensity > 0 ? target.color : BLACK_COLOR, 0.2);
        material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, target.intensity, 0.2);
        material.opacity = THREE.MathUtils.lerp(material.opacity, target.opacity, 0.2);
      }
    });

    return (
      <group ref={ref} {...props} dispose={null}>
        {ELECTRODE_NODE_PLACEMENTS.map(({ name, nodeKey, position, rotation }) => {
          const node =
            nodes[nodeKey] ||
            (nodes as unknown as Record<string, THREE.Mesh>)[`HemiSphere.${name}`] ||
            (nodes as unknown as Record<string, THREE.Mesh>)[`HemiSphere${name}`];
          if (!node || !node.geometry) return null;

          return (
            <ElectrodeNode
              key={name}
              name={name}
              geometry={node.geometry}
              position={position}
              rotation={rotation}
              isSelected={name === selectedChannel}
              isHovered={name === hoveredChannel}
              onRef={(chName, mesh) => {
                if (mesh) meshRefs.current[chName] = mesh;
              }}
              onSelect={onChannelSelect}
              onHover={onChannelHover}
            />
          );
        })}

        {nodes.Modular_Headset?.geometry && (
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Modular_Headset.geometry}
            material={materials.MattBlack}
            scale={0.161}
          />
        )}
      </group>
    );
  }
);

EEGHead.displayName = "EEGHead";

useGLTF.preload("/digitalTwin.glb");

export default EEGHead;
