# layout.ts

Pure canvas-geometry helpers, independent of any electrode data.

- `resizeCanvasToDisplaySize(canvas, ctx)` — syncs the canvas backing store
  to its CSS size at the current `devicePixelRatio`, resets/rescales the
  context, clears it, and returns the CSS-pixel `{ width, height }` all
  drawing should use.
- `computeLaneLayout(width, height, numElectrodes)` — divides the padded
  drawing area into one horizontal lane per electrode.
- `laneCenterY(layout, idx)` — vertical center of lane `idx`.
