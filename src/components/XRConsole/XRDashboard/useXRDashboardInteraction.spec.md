# useXRDashboardInteraction

Translates Three.js 3D pointer UV hits into 2D UI actions on the XR Dashboard canvas.

### Purpose
Calculates 2D canvas pixel coordinates from normalized UV texture mapping and tests against registered interactive hit zones (trials on the timeline, play/pause, and speed toggles).

### Parameters
- `hitAreasRef`: Ref containing registered interactive bounding boxes.
- `onTrialSelect`: Callback triggered when a trial segment is clicked.
- `onTogglePlayPause`: Callback triggered when play/pause is clicked.
- `onSetSpeed`: Callback triggered when speed toggle is clicked.
- `speed`: Current speed multiplier.

### Returns
- `handlePointerDown`: Pointer event handler attached to the 3D dashboard screen mesh.
