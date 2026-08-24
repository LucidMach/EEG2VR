# useFrameTick.ts

Side-effect-only hook: the 20 Hz (`FRAME_INTERVAL_MS = 50`) playback clock.
During demo mode stimulus, playback is slaved to the active `<audio>` element as
an authoritative master clock. During baseline (0..3s), idle, and live modes,
time advances using high-resolution `performance.now()` delta timing.

Each tick advances `timeRef`, asks `sourceRef.current` for the `Frame` at
that time, writes it to `frameRef` (read by the 3D scene/oscilloscope render
loops) and `setFrame` (read by the DOM HUD), and appends a sample per
electrode into `historiesRef` via [[history|pushSample]].

**Non-obvious**: in `demo` mode, elapsed time wraps modulo `40 * TRIAL_SECONDS`
so a 40-trial DEAP session loops instead of running past the end. Paused via
`isPaused` short-circuit, not by clearing the interval on every tick.

Also exports `TRIAL_SECONDS` (63s: 3s baseline + 60s stimulus) and `BASELINE_SECONDS` (3s),
reused across the engine.

