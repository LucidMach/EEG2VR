# R3F

Composition root mounted by `src/pages/index.astro`. Owns the
[[../../hooks/usePlaybackEngine/index|playback engine]] and lays out its
panels based on `engine.mode`:

- Idle: `IdleHeadline`/`IdleActions` (`../IdleSplash.tsx`) over the showcase spin.
- Any active mode: [[TopHudBar]] (exit/phase/playback controls).
- Demo only: [[DemoBottomControls]] (trial timeline + dial).
- Always: [[../BackgroundOscilloscopes/index|BackgroundOscilloscopes]] behind
  everything, `Scene` (`../Scene.tsx`, the 3D canvas) in the middle, and
  conditionally [[ChannelTooltip]], [[AudioErrorToast]], [[LoadingOverlay]].

[[useSpacebarToggle]] wires the global play/pause shortcut.

**Non-obvious**: `Scene` is loaded via `React.lazy`/`Suspense` (fallback
`null`) rather than a static import, splitting the three.js/r3f/XR bundle
out of the initial page chunk.
