# TextLink

A secondary, text-only XR action (used for "Connect your EEG headset" and
"Exit XR Mode" in [[index|IdleActionsXR]]): a `<Text>` label plus an
invisible padded hit-plane sibling so the click/hover target is a
comfortable zone rather than just the glyph outline.

**Props**: `label`, `onClick?`, `position`, `fontSize?`, `idleColor`,
`hoverColor`, `hitWidth?`, `hitHeight?`.

**Non-obvious**: the hit-plane uses `transparent opacity={0}` rather than
`visible={false}` — an invisible object is still hit-tested by three.js's
raycaster, but a non-visible one risks being skipped depending on the
backend, so this keeps the enlarged hit area reliable. Hover and click both
trigger `triggerXRHaptic` (`src/utils/xrHaptics.ts`) to match
[[../XRControlBar/XRControlPill|XRControlPill]]'s feel.
