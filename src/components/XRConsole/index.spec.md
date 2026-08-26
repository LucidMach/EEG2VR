# XRConsole

Floating 3D control board mounted by [[../HeadWrapper/index|HeadWrapper]], visible while presenting in WebXR to provide telemetry, mode controls, and full demo dashboard.

**Props**: `frameRef`, `historiesRef`, `selectedChannel`, `onChannelSelect?`, `onChannelHover?`, `onStartDemo`, `onStartLive`, `onTrialSelect`, `onTogglePlayPause`, `onSetSpeed`, `speed`, `isPaused`, `audioError?`.

Delegates state tracking to [[useConsoleSnapshot]] for the idle/in-VR gate. Renders [[IdleActionsXR]] alone on the homescreen (idle phase); otherwise renders [[XRAudioErrorAlert]], the [[XRCylinderWall]] telemetry monitor wall with interactive channel picking, and the [[XRControlBar]] trial/playback console together. Returns `null` (mounts nothing) whenever the snapshot says we're not in VR.

