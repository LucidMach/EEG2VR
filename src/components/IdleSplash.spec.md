# IdleSplash.tsx

Idle-mode marketing splash, only ever shown while `engine.mode.kind === "idle"`
(see [[r3f/index|R3F]]).

- `IdleHeadline({ variant })` — the "an MNET experience / BrainXR" headline.
  Rendered twice by the caller: once `variant="solid"` behind the headset,
  once `variant="outline"` in front of it, so the 3D model appears to sit
  between the two text layers.
- `IdleActions({ onStartDemo, onStartLive })` — the bottom call-to-action
  buttons that kick off Demo Mode or Live Mode.
- `SpannedText` (internal) — renders a string as one `<span>` per character
  with `justify-between`, spreading the text edge-to-edge.
