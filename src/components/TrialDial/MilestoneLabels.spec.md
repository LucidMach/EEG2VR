# MilestoneLabels.tsx

Renders clickable trial-number buttons at the 5 milestone tick positions
(trials 1, 10, 20, 30, 40), positioned outside the tick ring.

**Props**: `trialIndex`, `phase`, `onTrialSelect`. Clicking a label calls
`onTrialSelect(index)` directly (no drag involved).
