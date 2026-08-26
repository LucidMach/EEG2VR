# ElectrodeNode.tsx

Renders one electrode's clickable LED mesh at a fixed scale (2.1) with an animated glowing halo aura when selected or hovered.

**Props**: `name`, `geometry`, `position`, `rotation`, `isSelected?`, `isHovered?`, `onRef`, `onSelect?`, `onHover?`.

**Non-obvious**: the mesh has no local base color state — [[index|EEGHead]]'s
`useFrame` loop mutates the base LED material directly on the ref it collects via
`onRef`, lerping toward [[../../utils/electrodeVisualState|computeElectrodeVisualState]]'s
target each frame. When `isSelected` or `isHovered` is true, an animated multi-layered halo shell, outer radiant corona, and local point light render around the electrode node, pulsing via `useFrame`. `onPointerDown` and `onClick` select the electrode with XR haptic feedback; `onRef` is how the parent finds this mesh again without React state.

