# ConsolePanel.tsx

The console's 3D plate and text layout: title, trial/phase context line,
valence/arousal (stimulus only), focus/avg (stimulus only), and a sensor
monitor box showing the selected electrode's value.

**Props**: `snapshot` (`ConsoleSnapshot`), `selectedChannel`. Assumes the
caller has already checked `snapshot.inVR && snapshot.phase !== "idle"` —
see [[index]].
