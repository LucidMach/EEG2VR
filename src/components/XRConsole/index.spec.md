# XRConsole

Floating 3D control board mounted by [[../HeadWrapper/index|HeadWrapper]], visible while presenting in WebXR to provide telemetry and mode controls ("Run Demo Mode" & "Connect your EEG headset").

**Props**: `frameRef`, `selectedChannel`, `onStartDemo`, `onStartLive`.

Delegates state tracking to [[useConsoleSnapshot]] and rendering to [[ConsolePanel]]; returns `null` (mounts nothing) whenever the snapshot says we're not in VR.

