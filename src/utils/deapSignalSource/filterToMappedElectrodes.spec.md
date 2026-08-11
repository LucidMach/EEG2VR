# filterToMappedElectrodes.ts

`filterToMappedElectrodes(channels) -> Partial<Record<ElectrodeName, number[]>>`
— keeps only the DEAP channels that have a matching `ELECTRODE_NAMES` entry,
dropping the rest (a Participant's recording may include channels with no
position on the Digital Twin).
