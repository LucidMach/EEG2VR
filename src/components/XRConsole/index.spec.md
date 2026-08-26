# XRConsole

Floating 3D control board mounted by [[../HeadWrapper/index|HeadWrapper]], visible while presenting in WebXR to provide telemetry, mode controls, and full demo dashboard.

**Props**: `frameRef`, `historiesRef`, `selectedChannel`, `hoveredChannel`, `onChannelSelect`, `onChannelHover`, `onStartDemo`, `onStartLive`, `onTrialSelect`, `onTogglePlayPause`, `onSetSpeed`, `speed`, `isPaused`.

Delegates state tracking to [[useConsoleSnapshot]], rendering [[IdleActionsXR]] when idle, [[XRDashboard]] when in Demo Mode, and [[ConsolePanel]] during quality-check; returns `null` (mounts nothing) whenever the snapshot says we're not in VR.
