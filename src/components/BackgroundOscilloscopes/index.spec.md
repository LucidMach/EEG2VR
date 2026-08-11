# BackgroundOscilloscopes

Full-viewport canvas behind the 3D scene, showing all 21 electrodes'
rolling 3-second waveforms.

**Props**: `historiesRef`, `frameRef`, `selectedChannel`.

Runs its own `requestAnimationFrame` loop rather than reacting to React
state — it repaints only when `frameRef.current` changes identity (a new
engine tick) or `selectedChannel` changes, reading `historiesRef` directly.
`React.memo`-wrapped since its props are stable refs; only `selectedChannel`
should trigger a re-render (and even that just changes the effect's deps,
not JSX output).

Drawing itself is delegated to [[render]].
