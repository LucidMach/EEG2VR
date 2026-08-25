# useConsoleSnapshot.ts

`useConsoleSnapshot(frameRef, selectedChannel) -> ConsoleSnapshot` — bridges
the ref-based live `Frame` into React state for [[index|XRConsole]]'s
`inVR`/`phase` gate, but only while presenting in WebXR.

**Non-obvious**: builds a signature string from every displayed field each
`useFrame` tick and only calls `setSnapshot` when it changes, so the console
doesn't re-render 90x/sec just because the underlying `Frame` object's
identity changed — only when a value it actually shows did. Snapshot resets
to `EMPTY_SNAPSHOT` (and stops updating) the moment XR presentation ends.
This throttled re-render is also what refreshes [[XRControlBar/index|XRControlBar]]
and [[XRCylinderWall/index|XRCylinderWall]]'s non-canvas parts in practice —
neither reads `frameRef` inside its own `useFrame`, so they piggyback on
`XRConsole` re-rendering.
