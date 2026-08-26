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

/**
 * Computes the outward-facing unit normal vector of an electrode's halo ring
 * in the headset model's local coordinate system.
 */
export function computeElectrodeRingNormal(
  placementRotation: [number, number, number],
  placementPosition: [number, number, number],
  geometry?: THREE.BufferGeometry
): THREE.Vector3 {
  let rot: [number, number, number] = [0, 0, 0];

  if (geometry) {
    if (!geometry.boundingBox) {
      geometry.computeBoundingBox();
    }
    const bb = geometry.boundingBox;
    if (bb) {
      const dx = bb.max.x - bb.min.x;
      const dy = bb.max.y - bb.min.y;
      const dz = bb.max.z - bb.min.z;

      // Smallest dimension indicates the hemisphere dome extrusion axis
      if (dy <= dx && dy <= dz) {
        rot = [Math.PI / 2, 0, 0];
      } else if (dx <= dy && dx <= dz) {
        rot = [0, Math.PI / 2, 0];
      } else {
        rot = [0, 0, 0];
      }
    }
  }

  // Base normal of RingGeometry / TorusGeometry (in XY plane, facing +Z)
  const normal = new THREE.Vector3(0, 0, 1);
  // Apply ring local rotation relative to dome base
  normal.applyEuler(new THREE.Euler(rot[0], rot[1], rot[2], "XYZ"));
  // Apply node placement rotation relative to headset
  normal.applyEuler(
    new THREE.Euler(placementRotation[0], placementRotation[1], placementRotation[2], "XYZ")
  );

  // Ensure normal points outward away from head center (y ~ 2.8)
  const headCenter = new THREE.Vector3(0, 2.8, 0);
  const outward = new THREE.Vector3(...placementPosition).sub(headCenter);
  if (normal.dot(outward) < 0) {
    normal.negate();
  }

  return normal.normalize();
}

/**
 * Computes the orientation quaternion for the headset such that the electrode ring's
 * outward normal aligns directly with targetDirection (orthogonally facing camera)
 * with zero/minimal roll relative to upReference (maintaining an upright head posture).
 */
export function computeFocusQuaternion(
  ringNormal: THREE.Vector3,
  targetDirection: THREE.Vector3 = new THREE.Vector3(0, 0, 1),
  upReference: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
): THREE.Quaternion {
  const fLocal = ringNormal.clone().normalize();
  const fWorld = targetDirection.clone().normalize();
  const upRef = upReference.clone().normalize();

  // Head local "up" natural axis
  const headUpLocal = new THREE.Vector3(0, 1, 0);

  // Construct local orthonormal basis [rLocal, uLocal, fLocal]
  let rLocal: THREE.Vector3;
  if (Math.abs(fLocal.dot(headUpLocal)) > 0.95) {
    // For electrodes near top/bottom pole (e.g. Cz), use head forward (0,0,1)
    // as reference so the face points forward/downward with level ears
    const headForwardLocal = new THREE.Vector3(0, 0, 1);
    rLocal = new THREE.Vector3().crossVectors(headUpLocal, headForwardLocal);
    if (fLocal.y < 0) {
      rLocal.negate();
    }
  } else {
    rLocal = new THREE.Vector3().crossVectors(headUpLocal, fLocal);
  }
  rLocal.normalize();
  const uLocal = new THREE.Vector3().crossVectors(fLocal, rLocal).normalize();

  // Construct world orthonormal basis [rWorld, uWorld, fWorld]
  let rWorld: THREE.Vector3;
  if (Math.abs(fWorld.dot(upRef)) > 0.95) {
    const worldForward = new THREE.Vector3(0, 0, -1);
    rWorld = new THREE.Vector3().crossVectors(upRef, worldForward);
  } else {
    rWorld = new THREE.Vector3().crossVectors(upRef, fWorld);
  }
  rWorld.normalize();
  const uWorld = new THREE.Vector3().crossVectors(fWorld, rWorld).normalize();

  // Basis matrices: M = [right, up, forward]
  const mLocal = new THREE.Matrix4().makeBasis(rLocal, uLocal, fLocal);
  const mWorld = new THREE.Matrix4().makeBasis(rWorld, uWorld, fWorld);

  // R = M_world * M_local^T
  const mLocalInv = mLocal.clone().transpose();
  const rMat = new THREE.Matrix4().multiplyMatrices(mWorld, mLocalInv);

  return new THREE.Quaternion().setFromRotationMatrix(rMat);
}

const DEFAULT_CAMERA_DIR = new THREE.Vector3(
  0,
  Math.sin(Math.PI / 32),
  Math.cos(Math.PI / 32)
).normalize();

// Precomputed outward unit normal vectors for each electrode ring on the headset
export const ELECTRODE_RING_NORMALS: Record<ElectrodeName, THREE.Vector3> = (() => {
  const map = {} as Record<ElectrodeName, THREE.Vector3>;
  for (const placement of ELECTRODE_NODE_PLACEMENTS) {
    map[placement.name] = computeElectrodeRingNormal(
      placement.rotation,
      placement.position
    );
  }
  return map;
})();

// Precomputed focus quaternions aligning each electrode's halo directly facing the camera
export const ELECTRODE_FOCUS_QUATERNIONS: Record<ElectrodeName, THREE.Quaternion> = (() => {
  const map = {} as Record<ElectrodeName, THREE.Quaternion>;
  for (const placement of ELECTRODE_NODE_PLACEMENTS) {
    map[placement.name] = computeFocusQuaternion(
      ELECTRODE_RING_NORMALS[placement.name],
      DEFAULT_CAMERA_DIR
    );
  }
  return map;
})();

/**
 * Updates the ring normal and focus quaternion for a specific electrode
 * using its loaded GLTF BufferGeometry.
 */
export function updateElectrodeGeometry(
  name: ElectrodeName,
  geometry: THREE.BufferGeometry
): void {
  const placement = ELECTRODE_NODE_PLACEMENTS.find((p) => p.name === name);
  if (!placement) return;
  const normal = computeElectrodeRingNormal(
    placement.rotation,
    placement.position,
    geometry
  );
  ELECTRODE_RING_NORMALS[name] = normal;
  ELECTRODE_FOCUS_QUATERNIONS[name] = computeFocusQuaternion(
    normal,
    DEFAULT_CAMERA_DIR
  );
}

/**
 * Returns the focus quaternion for an electrode targeting a specific camera vector.
 */
export function getElectrodeFocusQuaternion(
  name: ElectrodeName,
  targetDirection: THREE.Vector3 = DEFAULT_CAMERA_DIR,
  upReference: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
): THREE.Quaternion {
  const normal = ELECTRODE_RING_NORMALS[name];
  if (!normal) return DEFAULT_HEADSET_QUATERNION;
  return computeFocusQuaternion(normal, targetDirection, upReference);
}

export const DEFAULT_HEADSET_QUATERNION = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(Math.PI / 32, 0, 0, "YXZ")
);

