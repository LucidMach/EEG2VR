# XRConsole

Floating 3D control board mounted by [[../HeadWrapper/index|HeadWrapper]],
visible only while presenting in WebXR and outside the idle phase.

**Props**: `frameRef`, `selectedChannel`.

Delegates state tracking to [[useConsoleSnapshot]] and rendering to
[[ConsolePanel]]; returns `null` (mounts nothing) whenever the snapshot says
we're not in VR or we're idle.
