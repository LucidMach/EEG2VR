# useXRDashboardTexture

Manages the lifecycle of an offscreen 2D canvas and Three.js `CanvasTexture` for the XR Dashboard.

### Purpose
Renders the complete 2D dashboard (graphs, focus metrics, trials timeline, and telemetry) onto a high-DPI canvas texture and throttles updates to ~30 FPS during WebXR presentation.

### Parameters
- `frameRef`: Ref to the live 20 Hz frame.
- `historiesRef`: Optional ref to the 21-channel waveform ring buffers.
- `selectedChannel`: Name of the currently selected electrode.
- `speed`: Current playback speed multiplier.
- `isPaused`: Playback pause state.

### Returns
- `texture`: The `THREE.CanvasTexture` instance applied to the 3D monitor screen material.
- `hitAreasRef`: Ref containing bounding box coordinates of interactive UI elements on the canvas for raycasting.
