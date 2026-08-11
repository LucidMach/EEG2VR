# useDialInteraction.ts

Hook that turns mouse drag, touch drag, and mouse-wheel input on the dial
knob into `onTrialSelect(index)` calls.

**Signature**: `useDialInteraction(trialIndex, onTrialSelect) -> { knobRef, isDragging, activeAngle, handleMouseDown, handleTouchStart, handleWheel }`

- `knobRef` must be attached to the knob element — angle math is derived from
  its bounding rect center.
- Drag handlers convert pointer position to an angle (clamped to the dial's
  -120°..+120° sweep) and select whichever trial's tick angle is closest.
- Wheel input steps `trialIndex` by ±1, clamped to `[0, NUM_TRIALS - 1]`.
- `activeAngle` is `getAngleForIndex(trialIndex)`, for rotating the knob to
  match the current trial even when not dragging.
