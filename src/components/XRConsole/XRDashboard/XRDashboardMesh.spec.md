# XRDashboardMesh

3D monitor chassis that hosts the XR Dashboard screen plane in WebXR space.

### Purpose
Renders a beveled slate monitor housing, screen plane mapped with the dashboard `CanvasTexture`, and subtle glass sheen. Positions the monitor to the right of the Digital Twin headset, angled toward the user.

### Props
- `texture`: The Three.js `CanvasTexture` containing the rendered dashboard UI.
- `onPointerDown`: Pointer event handler for XR raycast clicks.
- `width`: Optional screen width in meters (default 0.96m).
- `height`: Optional screen height in meters (default 0.62m).
