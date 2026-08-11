# drawElectrodeLane.ts

Draws a single electrode's row: a dashed baseline grid line, its name label,
and the rolling waveform, zero-centered on `mean` and scaled by
`maxDeviation` ([[scale]]) to occupy at most 80% of the lane height.

**Non-obvious**: the waveform path is split and re-stroked at every
Baseline/Stimulus phase transition (dashed during baseline, solid during
stimulus) — a single `stroke()` call can't mix dash styles within one path,
so each style change ends the current path and starts a new one at the same
point.

`HISTORY_LIMIT` here must match [[../../hooks/usePlaybackEngine/history|the
engine's ring-buffer limit]] — it's duplicated locally rather than imported
since it's only used to derive the fixed pixel step between samples.
