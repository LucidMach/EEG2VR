# DragAffordance

Makes the digital twin's drag-to-reposition gesture discoverable in WebXR:
a translucent halo ring hovering horizontally above the crown of the EEG headset
while the head is hovered. Renders nothing (and updates nothing) outside XR presentation.

**Props**: `groupRef` (the head's own transform ref, read-only),
`hoveredRef` — from [[useHeadHoverAffordance]].

**Non-obvious**: doesn't parent under the head's group, because that group
is scaled to `0.012` while presenting (see [[useHeadPlacement]]) — any
child offset would need to be divided through that scale. Instead this
component owns its own group and copies the head's world position and rotation onto it
every frame, the same follower technique [[../XRConsole/XRCylinderWall/index|XRCylinderWall]]'s
pointer reticle uses, so the halo stays a fixed, sensible physical size.
