# Scene.tsx

The 3D scene root: `Canvas`, lighting rig, `XR` wrapper (WebXR entry via
[[../utils/xrStore|xrStore]]), orbit controls, and
[[HeadWrapper/index|HeadWrapper]] (the digital twin itself).

**Props**: `frameRef`, `selectedChannel`, `onChannelSelect`.

`React.memo`-wrapped and reads `frameRef` rather than a `frame` prop, so the
20 Hz playback tick updates the DOM HUD via state without forcing three.js
to reconcile this whole subtree — the head animates off its own `useFrame`
loop instead.
