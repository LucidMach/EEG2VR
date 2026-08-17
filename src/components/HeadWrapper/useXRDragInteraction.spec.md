# useXRDragInteraction.ts

Pointer down/move/up handlers implementing separate pan (front trigger)
and rotate (side/grip button) interactions for the headset group while presenting in WebXR. A no-op
outside XR (`gl.xr.isPresenting` guard on pointer-down).

**Signature**: `useXRDragInteraction({ gl, groupRef }) -> { isDraggingRef, xrPositionRef, xrRotationRef, handlePointerDown, handlePointerMove, handlePointerUp }`

- `xrPositionRef`/`xrRotationRef` are the persisted XR pose, read and updated
  here during a drag, and applied by [[useHeadPlacement]] whenever not
  dragging (so releasing the controller trigger/button leaves the headset in place).
- **Front Trigger (`e.button === 0`)**: Pans (translates) the headset position based on ray motion while preserving rotation.
- **Side Button (`e.button >= 1`)**: Rotates the headset based on the arc/axis of ray grab motion while preserving position.
- Uses `setPointerCapture`/`releasePointerCapture` so a fast drag that moves
  the ray off the mesh doesn't drop the gesture.

