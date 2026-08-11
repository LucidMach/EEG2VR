import * as THREE from "three";
import type { GLTF } from "three-stdlib";

// Shape of /digitalTwin.glb as loaded by useGLTF, typed by hand since the
// asset has no generated types checked into the repo.
export type GLTFResult = GLTF & {
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
