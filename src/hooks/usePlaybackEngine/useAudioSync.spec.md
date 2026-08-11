# useAudioSync.ts

Owns the demo-mode `<audio>` element and keeps it in lockstep with the
active trial/phase.

**Signature**: `useAudioSync({ mode, isPaused, speed, frame }) -> audioError`

- Off `demo` mode, tears the audio element down entirely.
- Picks `/audio/video-NN.m4a` from `frame.trialIndex` (1-indexed, zero-padded).
- During `stimulus`, resyncs `currentTime` if drifted >0.3s from
  `trialElapsed - 3` (the 3s baseline offset) and plays/pauses with
  `isPaused`; during `baseline`, pauses and rewinds to 0.
- `speed === 10` mutes audio (10x has no meaningful audio) but still sets
  `playbackRate`.
- `audioError` latches true on the element's `error` event (e.g. missing
  asset) and blocks further auto-play attempts until the src changes.
