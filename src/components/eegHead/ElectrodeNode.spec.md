# ElectrodeNode.tsx

Renders one electrode's clickable LED mesh at a fixed scale (2.1), with an interactive 3D glowing torus collar and outer halo ring around the sensor base upon selection or hover.

**Props**: `name`, `geometry`, `position`, `rotation`, `isSelected?`, `isHovered?`, `onRef`, `onSelect?`, `onHover?`.

**Non-obvious**: the mesh has no local color state — [[index|EEGHead]]'s
`useFrame` loop mutates the material directly on the ref it collects via
`onRef`, lerping toward [[../../utils/electrodeVisualState|computeElectrodeVisualState]]'s
target each frame. When `isSelected` (or `isHovered`), an aligned glowing ring collar
pulsing to the cortical region's color illuminates around the base of the LED mesh.
`onClick`/`onPointerDown` selects the electrode with WebXR haptics.
