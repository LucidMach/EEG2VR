# scale.ts

`computeScale(histories) -> { means, maxDeviation }` — per-electrode mean and
the single largest per-sample deviation from any electrode's mean, used to
auto-scale the waveform display so both DEAP's ~0-1 signal range and the
larger procedural-noise range stay visible at a consistent amplitude.

`maxDeviation` floors at `1.0` to avoid divide-by-zero or amplifying flat
noise when no samples have arrived yet.
