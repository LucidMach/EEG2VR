import * as THREE from "three";
import type { ElectrodeName } from "../../utils/signalSource";
import type { GLTFResult } from "./gltfTypes";

export interface ElectrodeNodePlacement {
  name: ElectrodeName;
  nodeKey: keyof GLTFResult["nodes"];
  position: [number, number, number];
  rotation: [number, number, number];
}

// Per-electrode mesh + transform on the digital twin, hand-measured against
// the Blender export. Scale is fixed (2.1) for every node — see ElectrodeNode.
export const ELECTRODE_NODE_PLACEMENTS: ElectrodeNodePlacement[] = [
  { name: "F7", nodeKey: "HemiSphereF7", position: [13.994, 2.857, 10.273], rotation: [-0.194, -0.475, -0.011] },
  { name: "C3", nodeKey: "HemiSphereC3", position: [12.638, 15.844, 0.075], rotation: [1.329, 0.742, 0.11] },
  { name: "C4", nodeKey: "HemiSphereC4", position: [-12.773, 15.844, 0.075], rotation: [-1.332, 0.75, 3.029] },
  { name: "Cz", nodeKey: "HemiSphereCz", position: [-0.108, 21.728, 0.075], rotation: [0.229, 1.392, 1.385] },
  { name: "F3", nodeKey: "HemiSphereF3", position: [9.679, 12.446, 12.046], rotation: [-1.958, -0.369, -0.731] },
  { name: "F4", nodeKey: "HemiSphereF4", position: [-10.432, 11.898, 12.256], rotation: [-1.973, 0.472, -2.266] },
  { name: "F8", nodeKey: "HemiSphereF8", position: [-14.666, 2.922, 10.539], rotation: [-2.954, -0.4, -2.989] },
  { name: "Fp1", nodeKey: "HemiSphereFp1", position: [6.489, 3.009, 19.009], rotation: [-0.411, -1.126, -0.296] },
  { name: "Fp2", nodeKey: "HemiSphereFp2", position: [-6.589, 2.784, 18.973], rotation: [-2.78, -1.063, -2.744] },
  { name: "FpZ", nodeKey: "HemiSphereFpZ", position: [-0.048, 3.088, 20.266], rotation: [-1.919, -1.387, -1.845] },
  { name: "Fz", nodeKey: "HemiSphereFz", position: [-0.027, 16.662, 13.312], rotation: [0.803, 1.392, 1.385] },
  { name: "O1", nodeKey: "HemiSphereO1", position: [5.96, 3.164, -18.826], rotation: [-0.417, 1.132, 0.46] },
  { name: "O2", nodeKey: "HemiSphereO2", position: [-6.208, 3.012, -18.902], rotation: [-2.742, 1.113, 2.859] },
  { name: "Oz", nodeKey: "HemiSphereOz", position: [-0.124, 3.012, -20.119], rotation: [-1.31, 1.392, 1.385] },
  { name: "P3", nodeKey: "HemiSphereP3", position: [10.905, 12.446, -13.202], rotation: [-1.233, -0.415, 0.834] },
  { name: "P4", nodeKey: "HemiSphereP4", position: [-10.339, 12.446, -12.793], rotation: [-1.161, 0.344, 2.347] },
  { name: "Pz", nodeKey: "HemiSpherePz", position: [-0.108, 16.662, -14.305], rotation: [-0.602, 1.392, 1.385] },
  { name: "T3", nodeKey: "HemiSphereT3", position: [16.912, 2.708, -0.193], rotation: [-0.173, -0.038, 0.073] },
  { name: "T4", nodeKey: "HemiSphereT4", position: [-16.932, 2.708, 0.035], rotation: [-2.969, 0.019, -3.066] },
  { name: "T5", nodeKey: "HemiSphereT5", position: [14.706, 2.708, -10.917], rotation: [-0.189, 0.422, 0.158] },
  { name: "T6", nodeKey: "HemiSphereT6", position: [-14.726, 2.708, -10.917], rotation: [-2.938, 0.559, 3.112] },
];

// Precomputed map of focus quaternions for each electrode.
// Rotates the headset such that the target electrode and its halo face directly
// toward the camera/user with zero roll for an upright presentation.
// Head center is offset at y ~ 2.8 on the digital twin coordinate space.
export const ELECTRODE_FOCUS_QUATERNIONS: Record<ElectrodeName, THREE.Quaternion> = (() => {
  const HEAD_CENTER_Y = 2.8;
  const CAMERA_PITCH = Math.PI / 32;
  const map = {} as Record<ElectrodeName, THREE.Quaternion>;
  for (const placement of ELECTRODE_NODE_PLACEMENTS) {
    const [x, y, z] = placement.position;
    const dy = y - HEAD_CENTER_Y;
    const theta = Math.atan2(x, z);
    const rxz = Math.sqrt(x * x + z * z);
    const phi = Math.atan2(dy, rxz);
    map[placement.name] = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(phi + CAMERA_PITCH, -theta, 0, "YXZ")
    );
  }
  return map;
})();

export const DEFAULT_HEADSET_QUATERNION = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(Math.PI / 32, 0, 0, "YXZ")
);

