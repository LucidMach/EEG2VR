# electrodeNodes.ts

`ELECTRODE_NODE_PLACEMENTS` — the 21 electrodes' mesh node name plus
hand-measured position/rotation on `/digitalTwin.glb`, consumed by
[[index|EEGHead]] to render one [[ElectrodeNode]] per entry.

Positions/rotations came from the Blender export and are not derived from
anything else in the codebase — treat them as fixture data, not something to
recompute.

Also exports `ELECTRODE_FOCUS_QUATERNIONS` (precomputed spherical focus
quaternions aligning each electrode vector to the front +Z axis with zero roll)
and `DEFAULT_HEADSET_QUATERNION`.

