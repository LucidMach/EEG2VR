# usePlaybackEngine

Composition root for the app's playback state machine. Owns the mode
(`idle` / `demo` / `live`), the current `Frame`, and the high-frequency refs
(`frameRef`, `historiesRef`) that the 3D scene and oscilloscope read off
their own render loops instead of React state — see the header comment in
`index.ts` for why.

Delegates to:
- [[useSignalSourceSwitch]] — points `sourceRef` at the right SignalSource per mode.
- [[useFrameTick]] — the 20 Hz clock that produces frames and history samples.
- [[useAudioSync]] — keeps demo-mode audio playback in lockstep.
- [[useEngineActions]] — `selectTrial`/`startDemo`/`startLive`/`disconnect`/`togglePlayPause`.
- [[history]] — the ring-buffer helpers behind `historiesRef`.

Returns a [[types|PlaybackEngine]]. The mutators come from `useEngineActions`;
everything else on the returned object is derived state.
