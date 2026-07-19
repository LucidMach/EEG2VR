// The SignalSource seam: one interface, two adapters (proceduralSignalSource,
// deapSignalSource). Both hand back a Frame for a given elapsedSeconds so the
// render loop in r3f.tsx can stay identical regardless of which is active.

// The 3D head model (eegHead.tsx) only has LEDs for these 21 electrodes.
// Any other channel a source produces (e.g. DEAP's 32-channel montage) gets
// filtered out at the adapter boundary rather than carried through the app.
export const ELECTRODE_NAMES = [
  "Fp1", "Fp2", "FpZ", "F3", "F4", "F7", "F8", "Fz",
  "C3", "C4", "Cz",
  "T3", "T4", "T5", "T6",
  "P3", "P4", "Pz",
  "O1", "O2", "Oz",
] as const;

export type ElectrodeName = (typeof ELECTRODE_NAMES)[number];

export type SignalPhase = "idle" | "baseline" | "stimulus" | "quality-check";

export interface ElectrodeSample {
  value: number; // microvolts
  quality?: "good" | "fair" | "poor"; // present during the quality-check phase
  impedance?: number; // kOhm, present during the quality-check phase
}

export interface TrialRatings {
  valence: number;
  arousal: number;
  dominance: number;
  liking: number;
}

// Self-describing: the adapter that owns trial/phase timing stamps it on
// every frame, so callers never need to know trial-duration constants.
export interface Frame {
  phase: SignalPhase;
  channels: Partial<Record<ElectrodeName, ElectrodeSample>>;
  trialIndex?: number;
  stimulusId?: string;
  ratings?: TrialRatings;
  trialElapsed?: number; // seconds elapsed in the current trial
}

export interface SignalSource {
  getFrame(elapsedSeconds: number): Frame;
}

export interface ElectrodeMetadata {
  name: ElectrodeName;
  fullName: string;
  region: "Frontal" | "Temporal" | "Central" | "Parietal" | "Occipital";
  description: string;
}

export const ELECTRODE_METADATA: Record<ElectrodeName, ElectrodeMetadata> = {
  Fp1: { name: "Fp1", fullName: "Left Frontopolar", region: "Frontal", description: "Involved in logical reasoning, working memory, and planning." },
  Fp2: { name: "Fp2", fullName: "Right Frontopolar", region: "Frontal", description: "Associated with emotional control and judgment." },
  FpZ: { name: "FpZ", fullName: "Midline Frontopolar", region: "Frontal", description: "Reflects prefrontal cortex activity and executive functions." },
  F7: { name: "F7", fullName: "Left Anterior Temporal", region: "Temporal", description: "Plays a role in verbal expression and speech production." },
  F3: { name: "F3", fullName: "Left Frontal", region: "Frontal", description: "Linked to motor planning and cognitive control." },
  Fz: { name: "Fz", fullName: "Midline Frontal", region: "Frontal", description: "Associated with attention, working memory, and mental effort." },
  F4: { name: "F4", fullName: "Right Frontal", region: "Frontal", description: "Important for spatial reasoning and non-verbal processing." },
  F8: { name: "F8", fullName: "Right Anterior Temporal", region: "Temporal", description: "Associated with emotional processing and visual memory." },
  C3: { name: "C3", fullName: "Left Central", region: "Central", description: "Overlies the primary motor cortex controlling the right side of the body." },
  Cz: { name: "Cz", fullName: "Midline Central", region: "Central", description: "Represents sensory-motor integration and coordinate systems." },
  C4: { name: "C4", fullName: "Right Central", region: "Central", description: "Overlies the primary motor cortex controlling the left side of the body." },
  T3: { name: "T3", fullName: "Left Temporal", region: "Temporal", description: "Auditory cortex area, also involved in language comprehension (Wernicke's)." },
  T4: { name: "T4", fullName: "Right Temporal", region: "Temporal", description: "Involved in music appreciation, environmental sounds, and facial recognition." },
  T5: { name: "T5", fullName: "Left Posterior Temporal", region: "Temporal", description: "Critical for visual-verbal integration and reading." },
  T6: { name: "T6", fullName: "Right Posterior Temporal", region: "Temporal", description: "Supports emotional recognition and holistic processing." },
  P3: { name: "P3", fullName: "Left Parietal", region: "Parietal", description: "Linked to mathematical computation and spatial orientation." },
  Pz: { name: "Pz", fullName: "Midline Parietal", region: "Parietal", description: "Reflects spatial awareness, navigation, and integration of senses." },
  P4: { name: "P4", fullName: "Right Parietal", region: "Parietal", description: "Involved in spatial maps, shape recognition, and attention." },
  O1: { name: "O1", fullName: "Left Occipital", region: "Occipital", description: "Primary visual cortex processing right-field visual information." },
  O2: { name: "O2", fullName: "Right Occipital", region: "Occipital", description: "Primary visual cortex processing left-field visual information." },
  Oz: { name: "Oz", fullName: "Midline Occipital", region: "Occipital", description: "Core visual processing area, active during visual stimulation or dreaming." },
};

export function getElectrodeMetadata(name: ElectrodeName): ElectrodeMetadata {
  return ELECTRODE_METADATA[name];
}
