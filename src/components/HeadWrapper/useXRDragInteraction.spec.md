# useXRDragInteraction.ts

Pointer down/move/up handlers implementing drag-to-reposition and
drag-to-rotate for the headset group while presenting in WebXR. A no-op
outside XR (`gl.xr.isPresenting` guard on pointer-down).

**Signature**: `useXRDragInteraction({ gl, groupRef }) -> { isDraggingRef, xrPositionRef, xrRotationRef, handlePointerDown, handlePointerMove, handlePointerUp }`

- `xrPositionRef`/`xrRotationRef` are the persisted XR pose, read and updated
  here during a drag, and applied by [[useHeadPlacement]] whenever not
  dragging (so releasing the controller trigger leaves the headset in place).
- Rotation is derived as the short-arc quaternion between the drag's start
  ray direction and the current ray direction (`setFromUnitVectors`), not
  from controller orientation directly — dragging rotates by "swinging" the
  controller ray, not by twisting the controller.
- Uses `setPointerCapture`/`releasePointerCapture` so a fast drag that moves
  the ray off the mesh doesn't drop the gesture.
