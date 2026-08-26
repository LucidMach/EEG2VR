# XRDashboardMesh

3D monitor chassis that hosts the XR Dashboard screen plane in WebXR space.

### Purpose
Renders a frameless screen plane mapped with the dashboard `CanvasTexture` and subtle glass sheen. Positions the monitor directly below the Digital Twin headset, tilted up toward the user.

### Props
- `texture`: The Three.js `CanvasTexture` containing the rendered dashboard UI.
- `onPointerDown`: Pointer event handler for XR raycast clicks.
- `onPointerMove`: Pointer move handler for dynamic pointer reticle tracking.
- `onPointerOut`: Pointer out handler for clearing the cursor reticle.
- `width`: Optional screen width in meters (default 0.96m).
- `height`: Optional screen height in meters (default 0.62m).
