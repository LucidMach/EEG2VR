# types.ts

`PlaybackEngine` — the public shape returned by [[index|usePlaybackEngine]].
Kept in its own module so consumers (`R3F`, `Scene`, `BackgroundOscilloscopes`)
can import just the type without pulling in hook implementation code.
