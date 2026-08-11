# ChannelTooltip.tsx

Small HUD panel shown near the top-left when an electrode is hovered,
reporting its live value (and impedance/quality when the active `Frame`
carries them — i.e. Quality Check mode).

**Props**: `channel` (`ElectrodeName`), `frame` (`Frame`).

**Non-obvious**: [[index]] currently never sets `hoveredChannel` (it's `useState`
with no setter wired to any hover handler), so this component doesn't render
in practice yet — hover-to-inspect is not wired up on the 3D model.
