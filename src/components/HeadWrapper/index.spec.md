# HeadWrapper

Wraps [[../eegHead/index|EEGHead]] with WebXR drag interaction and
placement, and mounts [[../XRConsole/index|XRConsole]] alongside it.

**Props**: `frameRef`, `historiesRef`, `selectedChannel`, `onChannelSelect`, `onStartDemo`, `onStartLive`, `onTrialSelect`, `onTogglePlayPause`, `onSetSpeed`, `speed`, `isPaused`.

Composed from [[useXRDragInteraction]] (pointer handlers + XR pose refs),
[[useHeadHoverAffordance]] (hover/first-drag tracking layered on top of
those handlers), and [[useHeadPlacement]] (the per-frame position/scale/
rotation logic for both XR and 2D desktop presentation). [[DragAffordance]]
renders the hover halo and one-time repositioning hint driven by
`useHeadHoverAffordance`'s refs.
