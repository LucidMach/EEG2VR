# HeadWrapper

Wraps [[../eegHead/index|EEGHead]] with WebXR drag interaction and
placement, and mounts [[../XRConsole/index|XRConsole]] alongside it.

**Props**: `frameRef`, `historiesRef`, `selectedChannel`, `onChannelSelect`, `onStartDemo`, `onStartLive`, `onTrialSelect`, `onTogglePlayPause`, `onSetSpeed`, `speed`, `isPaused`, `audioError?`.

Composed from [[useXRDragInteraction]] (pointer handlers + XR pose refs),
[[useHeadPlacement]] (the per-frame position/scale/rotation logic for both
XR and 2D desktop presentation), and [[spatialCollision]] (analytical anti-overlap constraints preventing the digital twin headset and floating control panel from colliding or intersecting).

