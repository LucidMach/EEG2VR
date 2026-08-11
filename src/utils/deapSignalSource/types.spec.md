# types.ts

- `DeapTrialAsset`/`DeapSessionAsset` — the on-disk shape of
  `/deap/participant-NN.json`, as agreed with whoever produces the DEAP
  export (channels keyed by 10-20 electrode name, not DEAP's raw index).
- `LoadedTrial` — the in-memory shape after [[filterToMappedElectrodes]]
  drops channels with no matching Digital Twin electrode.
- `DeapSignalSource` — a `SignalSource` plus `ready`, a promise that
  resolves once the asset has loaded (`getFrame` returns an idle frame
  until then).
