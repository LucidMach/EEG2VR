# render.ts

`render(ctx, canvas, histories, selectedChannel)` — the imperative draw
entry point called from [[index|BackgroundOscilloscopes]]'s animation-frame
loop. Resizes the canvas ([[layout]]), computes the auto-scale ([[scale]]),
then draws each electrode's lane ([[drawElectrodeLane]]) top to bottom in
`ELECTRODE_NAMES` order.
