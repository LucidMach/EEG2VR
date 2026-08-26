# useHeadPlacement.ts

The `useFrame` loop that positions/scales/rotates the headset group every
three.js frame.

**Signature**: `useHeadPlacement({ groupRef, frameRef, isDraggingRef, xrPositionRef, xrRotationRef, selectedChannel }): void`

- In WebXR: resets to a fixed pose (`(0, 1.3, -1.1)`, target rotation) the
  moment presentation starts, scales to real-world size (~22cm diameter),
  and smoothly slerps `xrRotationRef` towards the target focus quaternion computed dynamically from the user's VR camera line of sight, ensuring the `selectedChannel`'s ring faces the headset orthogonally (or default resting posture) — unless
  [[useXRDragInteraction]] has `isDraggingRef` set, in which case it leaves
  the group alone (the drag handlers are already writing to it directly).
- On the 2D desktop viewport: scales the model to occupy ~1/3 of the
  viewport height. In the idle phase it adds a slow showcase spin and a
  bobbing motion; otherwise it smoothly auto-rotates (slerps) the headset to focus on the `selectedChannel` so its ring faces the camera orthogonally with zero roll.

