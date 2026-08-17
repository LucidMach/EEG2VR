# ConsolePanel.tsx

The console's 3D plate and text layout: title, mode selection buttons (Run Demo Mode / Connect your EEG headset), trial/phase context line, valence/arousal (stimulus only), focus/avg (stimulus only), and a sensor monitor box showing the selected electrode's value.

**Props**: `snapshot` (`ConsoleSnapshot`), `selectedChannel`, `onStartDemo`, `onStartLive`. Assumes the caller has already checked `snapshot.inVR` — see [[index]].

