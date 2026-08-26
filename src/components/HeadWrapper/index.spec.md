# HeadWrapper

Wraps [[../eegHead/index|EEGHead]] with WebXR drag interaction and
placement, and mounts [[../XRConsole/index|XRConsole]] alongside it.

**Props**: `frameRef`, `historiesRef`, `selectedChannel`, `onChannelSelect`, `onStartDemo`, `onStartLive`, `onTrialSelect`, `onTogglePlayPause`, `onSetSpeed`, `speed`, `isPaused`.

Composed from [[useXRDragInteraction]] (pointer handlers + XR pose refs) and
[[useHeadPlacement]] (the per-frame position/scale/rotation logic for both
XR and 2D desktop presentation).
