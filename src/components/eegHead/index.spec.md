# EEGHead

Loads `/digitalTwin.glb` and renders the 21 electrode LEDs plus the headset
shell mesh, `forwardRef`'d so [[../HeadWrapper/index|HeadWrapper]] can attach
its own placement/rotation to the returned `THREE.Group`.

**Props**: `frameRef`, `selectedChannel?`, `hoveredChannel?`, `onChannelSelect?`, `onChannelHover?`, plus any
`<group>` props (spread through, e.g. `rotation`).

Its `useFrame` loop is the single place electrode color/emissive/opacity
values actually get written — see [[ElectrodeNode]]'s spec for why the
meshes themselves hold no color state. Built from [[gltfTypes|GLTFResult]]
and [[electrodeNodes|ELECTRODE_NODE_PLACEMENTS]].

**Non-obvious**: node lookup falls back from `nodeKey` (e.g. `HemiSphereF7`)
to `HemiSphere.{name}` and `HemiSphere{name}` before giving up on that
electrode, since different Blender/glTF exports of `digitalTwin.glb` have
named these nodes inconsistently. A placement with no matching node (or no
geometry) is skipped rather than crashing; same for `Modular_Headset`.
