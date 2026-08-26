# useXRDragInteraction.ts

Pointer down/move/up handlers implementing drag-to-reposition and
drag-to-rotate for spatial groups (such as [[EEGHead]] and [[../XRConsole/XRControlBar/index|XRControlBar]])
while presenting in WebXR. A no-op outside XR (`gl.xr.isPresenting` guard on pointer-down).

**Signature**: `useXRDragInteraction({ gl, groupRef, initialPosition?, initialRotation?, onDragStart?, onDragEnd? }) -> { isDraggingRef, xrPositionRef, xrRotationRef, handlePointerDown, handlePointerMove, handlePointerUp }`

- `xrPositionRef`/`xrRotationRef` are the persisted XR pose, read and updated
  here during a drag, and synced every frame via `useFrame` whenever not
  dragging (so releasing the controller trigger leaves the object anchored in place).
- Rotation is derived as the short-arc quaternion between the drag's start
  ray direction and the current ray direction (`setFromUnitVectors`), not
  from controller orientation directly — dragging rotates by "swinging" the
  controller ray, not by twisting the controller.
- Uses `setPointerCapture`/`releasePointerCapture` so a fast drag that moves
  the ray off the mesh doesn't drop the gesture.
- Supports optional `onDragStart` and `onDragEnd` callbacks for triggering UI state changes and haptics.

