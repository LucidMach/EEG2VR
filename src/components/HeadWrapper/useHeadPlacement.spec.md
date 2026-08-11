# useHeadPlacement.ts

The `useFrame` loop that positions/scales/rotates the headset group every
three.js frame.

**Signature**: `useHeadPlacement({ groupRef, frameRef, isDraggingRef, xrPositionRef, xrRotationRef }): void`

- In WebXR: resets to a fixed pose (`(0, 1.3, -1.1)`, identity rotation) the
  moment presentation starts, scales to real-world size (~22cm diameter),
  and otherwise follows `xrPositionRef`/`xrRotationRef` — unless
  [[useXRDragInteraction]] has `isDraggingRef` set, in which case it leaves
  the group alone (the drag handlers are already writing to it directly).
- On the 2D desktop viewport: scales the model to occupy ~1/3 of the
  viewport height. In the idle phase it adds a slow showcase spin and a
  bobbing motion; otherwise it holds a fixed tilted pose.
