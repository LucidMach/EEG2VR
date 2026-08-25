# XRDashboard

Full telemetry dashboard in WebXR mode during Demo Mode playback.

### Purpose
Replaces the simplified text console in WebXR with an interactive 3D dashboard displaying:
- 21-channel EEG oscilloscope waveform graphs matching `BackgroundOscilloscopes`.
- Focus dial metric gauge matching `TrialDial`.
- 40-trial progress timeline matching `TrialProgressBar`.
- Real-time channel telemetry and affective valence/arousal ratings.

### Props
- `frameRef`: Ref to the live 20 Hz frame.
- `historiesRef`: Optional ref to the 21-channel waveform ring buffers.
- `selectedChannel`: Name of the currently selected electrode.
- `speed`: Playback speed (1 or 10).
- `isPaused`: Whether playback is paused.
- `onTrialSelect`: Callback to switch trials.
- `onTogglePlayPause`: Callback to toggle play/pause.
- `onSetSpeed`: Callback to set speed multiplier.
