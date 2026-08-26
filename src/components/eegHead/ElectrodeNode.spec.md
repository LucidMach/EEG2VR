# ElectrodeNode.tsx

Renders one electrode's clickable LED mesh at a fixed scale (2.1), with an interactive 3D glowing torus collar and outer halo disc positioned outside the LED base on the headset casing upon selection or hover.

**Props**: `name`, `geometry`, `position`, `rotation`, `isSelected?`, `isHovered?`, `onRef`, `onSelect?`, `onHover?`.

**Non-obvious**: the mesh has no local color state — [[index|EEGHead]]'s
`useFrame` loop mutates the material directly on the ref it collects via
`onRef`, lerping toward [[../../utils/electrodeVisualState|computeElectrodeVisualState]]'s
target each frame. When `isSelected` (or `isHovered`), a concentric glowing torus collar
and halo disc pulsing to the cortical region's color illuminates outside around the base of the LED on the headset casing.
`onClick`/`onPointerDown` selects the electrode with WebXR haptics.

