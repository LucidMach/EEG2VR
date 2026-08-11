# TrialDial

The floating rotary dial (bottom-right, Demo Mode) for jumping between the
40 DEAP trials by drag, scroll, or milestone click.

**Props**: `trialIndex`, `totalTrials`, `phase`, `trialElapsed`, `focus?`,
`focus_avg?`, `onTrialSelect(index)`. `totalTrials` and `trialElapsed` are
accepted for interface symmetry with [[TrialProgressBar]] but unused here —
the dial always assumes 40 trials ([[angles]]).

Composed from [[useDialInteraction]] (drag/touch/wheel -> index) and the
visual pieces [[DialTicks]], [[DialKnob]], [[DialReadout]], [[MilestoneLabels]].
