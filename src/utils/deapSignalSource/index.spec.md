# deapSignalSource

`createDeapSignalSource(assetUrl?) -> DeapSignalSource` — a `SignalSource`
that replays a DEAP participant's recorded session (40 trials, 3s baseline +
60s stimulus each, looping) instead of synthesizing data.

Fetches `assetUrl` (default `/deap/participant-07.json`) in the background;
`getFrame` returns an idle frame until `ready` resolves. Built from
[[types]] (the asset/session shapes) and [[filterToMappedElectrodes]].

**Non-obvious**: `trialIndex` in the returned `Frame` is the *unwrapped*
index (mod 40, for the UI's dial/timeline), while trial data itself is
looked up mod `trials.length` — the two only diverge if the loaded asset
has fewer than 40 trials.
