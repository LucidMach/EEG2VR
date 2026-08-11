# gltfTypes.ts

`GLTFResult` — hand-written type for `/digitalTwin.glb`'s node/material
names, since the Blender export has no generated `.d.ts`. Consumed by
[[index|EEGHead]] (casts `useGLTF`'s return) and [[electrodeNodes]] (types
each placement's `nodeKey`).
