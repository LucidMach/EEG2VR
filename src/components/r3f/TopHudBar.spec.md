# TopHudBar.tsx

Composes [[BackButton]], [[PhaseIndicator]], and [[PlaybackControls]] into
the top HUD nav bar shown whenever the app isn't idle.

**Props**: `engine` (`PlaybackEngine`) — takes the whole engine object rather
than individual fields since it just forwards pieces to its three children.
