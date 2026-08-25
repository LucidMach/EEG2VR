# IdleActionsXR

The homescreen actions shown in WebXR while the app is idle: "Run Demo
Mode", "Connect your EEG headset", and "Exit XR Mode" — the only content
[[../index|XRConsole]] mounts before a session starts.

**Props**: `onStartDemo?`, `onStartLive?`, `onExitXR?`.

A frosted backing card (matching [[../XRControlBar/index|XRControlBar]] and
[[../XRAudioErrorAlert|XRAudioErrorAlert]]) sits behind all three actions —
this is the first surface a VR user sees, so it needs the same legibility
guarantee as every other console panel. The primary action reuses
[[../XRControlBar/XRControlPill|XRControlPill]]; the two secondary actions
are [[TextLink]].
