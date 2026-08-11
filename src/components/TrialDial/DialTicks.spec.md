# DialTicks.tsx

Renders the fixed ring of 40 gauge ticks around the dial as an absolutely
positioned SVG overlay (does not rotate).

**Props**: `trialIndex`, `phase` (`Frame["phase"]`).

Milestone indices ([[angles]] `isMilestone`) get a longer tick; the tick at
`trialIndex` is highlighted indigo (baseline) or emerald (stimulus).
