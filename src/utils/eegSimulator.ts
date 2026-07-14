// EEG channel definitions and simulator for 32 channels.

export interface ChannelData {
  name: string;
  value: number; // Current value in microvolts (uV), e.g., -50 to 50
  quality: 'good' | 'fair' | 'poor';
  impedance: number; // Impedance in kOhm, e.g., 2 to 25
  frequencies: {
    delta: number;
    theta: number;
    alpha: number;
    beta: number;
    gamma: number;
  };
}

export interface EEGFrame {
  timestamp: number;
  channels: Record<string, ChannelData>;
  activeState: string;
}

// 32 Standard EEG channels
export const EEG_CHANNELS = [
  "Fp1", "Fp2", "FpZ", "F7", "F3", "Fz", "F4", "F8",
  "FC5", "FC1", "FC2", "FC6", "T7", "C3", "Cz", "C4",
  "T8", "CP5", "CP1", "CP2", "CP6", "P7", "P3", "Pz",
  "P4", "P8", "O1", "O2", "Oz", "FCz", "CPz", "POz"
];

// Mapping for electrode positions and details
export interface ElectrodeMetadata {
  name: string;
  fullName: string;
  region: 'Frontal' | 'Temporal' | 'Central' | 'Parietal' | 'Occipital';
  description: string;
}

export const ELECTRODE_METADATA: Record<string, ElectrodeMetadata> = {
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
  Oz: { name: "Oz", fullName: "Midline Occipital", region: "Occipital", description: "Core visual processing area, active during visual stimulation or dreaming." }
};

// Fallback for channels that are in the 32-channel list but not in the 21-channel 3D model
const getFallbackMetadata = (name: string): ElectrodeMetadata => {
  const region = name.startsWith("Fp") || name.startsWith("F") ? "Frontal" :
                 name.startsWith("T") ? "Temporal" :
                 name.startsWith("C") ? "Central" :
                 name.startsWith("P") ? "Parietal" : "Occipital";
  return {
    name,
    fullName: `${name} Electrode`,
    region,
    description: `Channel ${name} of the 32-channel EEG grid. (Not mapped on 3D headset).`
  };
};

export function getElectrodeMetadata(name: string): ElectrodeMetadata {
  return ELECTRODE_METADATA[name] || getFallbackMetadata(name);
}

// Generate realistic simulated EEG signals
export function generateEEGFrame(
  time: number,
  state: 'alpha' | 'beta' | 'theta' | 'delta' | 'gamma' | 'quality' | 'normal'
): EEGFrame {
  const channels: Record<string, ChannelData> = {};

  EEG_CHANNELS.forEach((ch, idx) => {
    // Generate base signal frequencies (in Hz)
    const deltaFreq = 1.5 + Math.sin(time * 0.1 + idx) * 0.3;
    const thetaFreq = 5.5 + Math.cos(time * 0.15 + idx) * 0.5;
    const alphaFreq = 10.0 + Math.sin(time * 0.2 + idx) * 0.8;
    const betaFreq = 20.0 + Math.cos(time * 0.3 + idx) * 2.0;
    const gammaFreq = 40.0 + Math.sin(time * 0.5 + idx) * 5.0;

    // Define amplitudes based on the current brain state
    let aDelta = 5 + Math.sin(time * 0.5 + idx) * 2;
    let aTheta = 6 + Math.cos(time * 0.4 + idx) * 2;
    let aAlpha = 8 + Math.sin(time * 0.3 + idx) * 3;
    let aBeta = 4 + Math.cos(time * 0.6 + idx) * 1.5;
    let aGamma = 1 + Math.sin(time * 0.8 + idx) * 0.5;

    if (state === 'delta') {
      aDelta = 40 + Math.sin(time * 0.5 + idx) * 10;
      aTheta = 4; aAlpha = 2; aBeta = 1; aGamma = 0.2;
    } else if (state === 'theta') {
      aTheta = 35 + Math.cos(time * 0.4 + idx) * 8;
      aDelta = 6; aAlpha = 3; aBeta = 2; aGamma = 0.5;
    } else if (state === 'alpha') {
      // Alpha waves are especially prominent in occipital lobes (O1, O2, Oz)
      const occipitalMultiplier = ch.startsWith('O') ? 2.5 : 1.0;
      aAlpha = (30 + Math.sin(time * 0.6 + idx) * 6) * occipitalMultiplier;
      aDelta = 5; aTheta = 4; aBeta = 2; aGamma = 0.5;
    } else if (state === 'beta') {
      // Beta waves are prominent in frontal lobes (Fp1, Fp2, F3, F4, Fz)
      const frontalMultiplier = ch.startsWith('F') ? 2.0 : 1.0;
      aBeta = (25 + Math.cos(time * 0.8 + idx) * 5) * frontalMultiplier;
      aDelta = 4; aTheta = 3; aAlpha = 3; aGamma = 1.0;
    } else if (state === 'gamma') {
      aGamma = 15 + Math.sin(time * 1.2 + idx) * 4;
      aDelta = 3; aTheta = 2; aAlpha = 2; aBeta = 5;
    } else if (state === 'quality') {
      // Regular background brain activity, focus is on connection quality
      aAlpha = 10; aBeta = 8; aTheta = 6; aDelta = 4; aGamma = 1;
    } else { // 'normal' background state
      aAlpha = 12 + Math.sin(time * 0.4 + idx) * 3;
      aBeta = 10 + Math.cos(time * 0.6 + idx) * 2;
      aTheta = 8 + Math.sin(time * 0.2 + idx) * 2;
      aDelta = 6 + Math.cos(time * 0.1 + idx) * 1.5;
      aGamma = 2 + Math.sin(time * 0.8 + idx) * 0.5;
    }

    // Phase offset per channel to create wave-like propagation
    const phaseOffset = idx * 0.25;

    // Synthesize the signal value (microvolts)
    let value =
      aDelta * Math.sin(2 * Math.PI * deltaFreq * time + phaseOffset) +
      aTheta * Math.sin(2 * Math.PI * thetaFreq * time + phaseOffset * 1.2) +
      aAlpha * Math.sin(2 * Math.PI * alphaFreq * time + phaseOffset * 1.5) +
      aBeta * Math.sin(2 * Math.PI * betaFreq * time + phaseOffset * 1.8) +
      aGamma * Math.sin(2 * Math.PI * gammaFreq * time + phaseOffset * 2.2);

    // Add high frequency noise
    value += (Math.random() - 0.5) * 2.5;

    // Quality mapping:
    // If state is 'quality', simulate a couple of channels failing or having high impedance.
    let quality: 'good' | 'fair' | 'poor' = 'good';
    let impedance = 3.5 + Math.sin(time * 0.05 + idx) * 1.2; // kOhm

    if (state === 'quality') {
      // Simulate poor connection on specific electrodes (e.g. T3, T4, Fp1)
      if (idx === 3 || idx === 12 || idx === 20) { // T4, T3, etc.
        quality = 'poor';
        impedance = 25.0 + Math.sin(time) * 2.0;
        value = (Math.random() - 0.5) * 15; // Mostly noise
      } else if (idx === 7 || idx === 15) {
        quality = 'fair';
        impedance = 12.0 + Math.cos(time) * 1.5;
        value *= 0.5; // Attenuated signal
      }
    } else {
      // Standard slight variance in connection quality
      if (idx === 12) { // T3 is always a bit tricky
        quality = 'fair';
        impedance = 8.5;
      }
    }

    // Normalize power spectra (for UI bars)
    const totalPower = aDelta + aTheta + aAlpha + aBeta + aGamma;
    channels[ch] = {
      name: ch,
      value,
      quality,
      impedance,
      frequencies: {
        delta: aDelta / totalPower,
        theta: aTheta / totalPower,
        alpha: aAlpha / totalPower,
        beta: aBeta / totalPower,
        gamma: aGamma / totalPower
      }
    };
  });

  return {
    timestamp: time,
    channels,
    activeState: state
  };
}
