# useHeadHoverAffordance.ts

`useHeadHoverAffordance(handlePointerDown) -> { hoveredRef, hasDraggedRef, onPointerDown, onPointerOver, onPointerOut }`

Wraps [[useXRDragInteraction]]'s `handlePointerDown` to also flip
`hasDraggedRef` permanently true on first use, and adds hover tracking —
ready-to-spread pointer handlers for [[index|HeadWrapper]]'s draggable
group. Feeds [[DragAffordance]], which reads both refs each frame to decide
whether to show the hover halo and the one-time repositioning hint.

**Non-obvious**: state lives in refs, not React state — the pointer handlers
fire well inside the XR/three.js event loop and shouldn't trigger a React
re-render of this whole memoized subtree just to toggle a hover cue.
