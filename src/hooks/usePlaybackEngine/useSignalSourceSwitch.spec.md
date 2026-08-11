# useSignalSourceSwitch.ts

Side-effect-only hook: reacts to `mode` changes and points `sourceRef` at the
right `SignalSource` (idle / DEAP demo / quality-check), resetting the
playback clock and histories each time.

**Non-obvious**: for `mode.kind === "demo"`, `createDeapSignalSource()`
kicks off a multi-MB fetch/parse; `isLoading` stays true until
`source.ready` resolves, and the effect's cleanup guards against setting
`isLoading` after an unmount/mode-change race via the `cancelled` flag.
