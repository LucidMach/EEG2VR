# angles.ts

Pure geometry helpers shared by the dial's ticks, knob rotation, and milestone
labels, so the -120°..+120° sweep math and milestone set live in one place.

- `NUM_TRIALS` — always 40; the dial always shows the full DEAP session.
- `getAngleForIndex(index)` — trial index -> angle in degrees along the sweep.
- `isMilestone(i)` — true for indices 0, 9, 19, 29, 39 (trials 1, 10, 20, 30, 40).
- `getMilestoneLabel(i)` — display label for a milestone index ("01", "10", ...).
