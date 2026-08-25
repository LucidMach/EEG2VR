# Scene.tsx

The 3D scene root: `Canvas`, lighting rig, `XR` wrapper (WebXR entry via
[[../utils/xrStore|xrStore]]), orbit controls, and
[[HeadWrapper/index|HeadWrapper]] (the digital twin itself and the XR Console).

**Props**: `frameRef`, `historiesRef`, `selectedChannel`, `onChannelSelect`, `onStartDemo`, `onStartLive`, `onTrialSelect`, `onTogglePlayPause`, `onSetSpeed`, `speed`, `isPaused`.

`React.memo`-wrapped and reads `frameRef` / `historiesRef` rather than `frame` prop, so the
20 Hz playback tick updates the DOM HUD via state without forcing three.js
to reconcile this whole subtree — the head and XR dashboard animate off their own loops instead.
