# history.ts

Pure helpers for the per-electrode rolling waveform buffers ("histories")
that back the [[BackgroundOscilloscopes/index|background oscilloscope]].

- `HISTORY_LIMIT` — 60 samples = 3 seconds at the engine's 20 Hz tick.
- `Histories` — `Record<ElectrodeName, HistorySample[]>`; one ring buffer per electrode.
- `createEmptyHistories()` — builds a fresh, empty `Histories`.
- `clearHistories(histories)` — empties all buffers **in place**, so a ref
  holding a `Histories` keeps its identity (consumers reading the ref don't
  need to re-subscribe).
- `pushSample(histories, name, sample)` — appends and evicts the oldest
  sample once a buffer exceeds `HISTORY_LIMIT`, also in place.
