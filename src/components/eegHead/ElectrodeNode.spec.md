# ElectrodeNode.tsx

Renders one electrode's clickable LED mesh at a fixed scale (2.1).

**Props**: `name`, `geometry`, `position`, `rotation`, `onRef`, `onSelect?`.

**Non-obvious**: the mesh has no local color state — [[index|EEGHead]]'s
`useFrame` loop mutates the material directly on the ref it collects via
`onRef`, lerping toward [[../../utils/electrodeVisualState|computeElectrodeVisualState]]'s
target each frame. `onClick` selects the electrode; `onRef` is how the
parent finds this mesh again without React state.
