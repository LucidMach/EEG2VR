# electrodeNodes.ts

`ELECTRODE_NODE_PLACEMENTS` — the 21 electrodes' mesh node name plus
hand-measured position/rotation on `/digitalTwin.glb`, consumed by
[[index|EEGHead]] to render one [[ElectrodeNode]] per entry.

Positions/rotations came from the Blender export and are not derived from
anything else in the codebase — treat them as fixture data, not something to
recompute.

Also exports `ELECTRODE_RING_NORMALS` (outward unit normal vectors for each electrode halo ring), `computeElectrodeRingNormal`, `computeFocusQuaternion`, `updateElectrodeGeometry`, `getElectrodeFocusQuaternion` (computing focus quaternions aligning each electrode's normal/halo directly facing any target camera direction orthogonally with zero roll while maintaining upright posture), `ELECTRODE_FOCUS_QUATERNIONS`, and `DEFAULT_HEADSET_QUATERNION`.

