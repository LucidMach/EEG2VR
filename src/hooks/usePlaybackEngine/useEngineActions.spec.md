# useEngineActions.ts

The mutator functions exposed on `PlaybackEngine`: `selectTrial`,
`startDemo`, `startLive`, `disconnect`, `togglePlayPause`. Pure `useCallback`
wiring over refs/setters owned by [[index|usePlaybackEngine]] — no state or
effects of its own.

**Non-obvious**: `startLive` stores the cancel function returned by
`simulateHeadsetConnection` into `cancelConnectionRef` so a later
`startDemo`/`startLive`/`disconnect` call (or unmount) can cancel an
in-flight mock connection sequence.
