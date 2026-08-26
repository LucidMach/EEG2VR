# spatialCollision.ts

Analytical 3D collision resolution and anti-overlap constraints between the [[index|EEGHead]] bounding sphere and the [[../XRConsole/XRControlBar/index|XRControlBar]] oriented bounding box (OBB) in WebXR space.

**Constants**:
- `HEAD_BOUNDS`: `{ radius: 0.18 }` (18cm exclusion radius enclosing digital twin mesh and sensor LEDs).
- `PANEL_BOUNDS`: `{ halfWidth: 0.40, halfHeight: 0.17, halfDepth: 0.06 }` (enclosing the 0.78m × 0.32m floating control card).

**Functions**:
- `resolvePanelPosition(candidatePanelPos, panelQuat, headPos)`: Transforms head center into panel local space, finds the closest point on the clamped panel box, and pushes the candidate panel position away along the contact normal if penetration is detected.
- `resolveHeadPosition(candidateHeadPos, headQuat, panelPos, panelQuat)`: Prevents the EEG head sphere from penetrating the panel box, pushing the head away along the contact normal when overlapping.
