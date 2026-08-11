# DialKnob.tsx

The rotating knob button: phase-colored inside border, an active-trial
pointer triangle, and the [[WatermarkLogo]]. Wraps the pointer/wheel handlers
from [[useDialInteraction]].

**Props**: `knobRef`, `phase`, `isDragging`, `activeAngle`, `onMouseDown`, `onTouchStart`, `onWheel`.

**Non-obvious**: this element rotates via inline `transform: rotate(...)`.
Content that must stay upright while the knob spins (the focus readout) is
rendered by the parent as a sibling, not passed as children here.
