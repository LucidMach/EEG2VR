# pointerCapture.ts

`capturePointer(e)` / `releasePointer(e)` — thin, defensive wrappers around
`setPointerCapture`/`releasePointerCapture` used by [[useXRDragInteraction]]
so a drag keeps tracking the controller ray even if it moves off the mesh.
