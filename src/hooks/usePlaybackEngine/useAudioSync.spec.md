# useAudioSync.ts

Owns the demo-mode `<audio>` element lifecycle and serves as the audio master
clock controller for [[useFrameTick]].

**Signature**: `useAudioSync({ mode, isPaused, speed, timeRef }) -> AudioController`

- Off `demo` mode, tears the audio element down entirely.
- Picks `/audio/video-NN.m4a` from the active trial index (1-indexed, zero-padded).
- Serves as the authoritative master clock during the stimulus phase; avoids destructive
  periodic seeking so audio plays without jitter or clicks.
- Provides `syncTrialAudio`, `playStimulusAudio`, and `pauseAudio` helpers for trial
  transitions, seeks, and play/pause controls.
- `speed === 10` mutes audio (10x has no meaningful audio) but still sets
  `playbackRate`.
- `audioError` latches true on the element's `error` event (e.g. missing
  asset) and blocks further auto-play attempts until the src changes.

