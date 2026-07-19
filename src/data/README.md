# DEAP s07 — EMA-smoothed EEG

Envelope-smoothed EEG for **participant 7** of the DEAP dataset, prepared as a driver signal for a 3D electrode visualisation (32 bulbs on a head model, brightness following brain activity).

> **This is derived data, not DEAP itself.** The raw dataset is licensed and must be obtained from the [original source](https://www.eecs.qmul.ac.uk/mmv/datasets/deap/) under its EULA. Nothing here redistributes the raw recordings.

---

## What's in here

| File | Shape | Description |
|---|---|---|
| `s07_ema.json` | 40 trials × 32 ch × 8064 | All trials, EMA-smoothed, with stimulus metadata |
| `s07_trial00_ema.csv` | 8064 × 33 | Single trial, flat table (32 channels + `stimuli`) |
| `s07_stimuli.csv` | 40 × 4 | Trial → video lookup |

---

## Processing

Raw EEG is a signed voltage oscillating around zero, so a plain average collapses to nothing. Three steps fix that:

**1. Rectify.** Take the absolute value. Direction doesn't matter for activity — a −40 µV swing is as much brain as +40 µV. What survives is the *envelope*: how hard the signal is swinging.

```python
env = np.abs(sig)
```

**2. Exponential moving average.** Blend each sample into a running value, so the trace has inertia and stops flickering.

```python
new = alpha * current + (1 - alpha) * previous
```

**3. Set alpha from a time constant.** `alpha` is an opaque number; `tau` is not. Pick how many seconds of memory you want and derive the rest.

```python
tau   = 1.0                                # seconds
alpha = 1 - np.exp(-1 / (tau * 128))       # ≈ 0.0078
```

At `tau = 1.0` the signal closes ~63% of the gap to a new value each second — smooth enough to watch, fast enough to track.

### Deliberate choices

- **No baseline removal.** The full 63 s is kept (3 s pre-stimulus + 60 s stimulus). Band amplitude is a variance measure and is unaffected by a constant offset, so the correction changes almost nothing here.
- **No normalisation.** Values are raw microvolts. Consumers that need `0–1` (a renderer setting `emissiveIntensity`, say) should scale per channel — see below.
- **EEG only.** Channels 32–39 of the source array (EOG, EMG, GSR, respiration, plethysmograph, temperature) are excluded.

---

## `s07_ema.json`

```json
{
  "participant_id": 7,
  "sampling_rate": 128,
  "tau": 1.0,
  "n_trials": 40,
  "trials": [
    {
      "participant_id": 7,
      "trial_no": 0,
      "experiment_id": 17,
      "youtube_link": "http://www.youtube.com/watch?v=...",
      "channels": ["Fp1", "AF3", "F3", "..."],
      "samples": [[2.026, 2.041, "..."], "..."]
    }
  ]
}
```

`samples[c][t]` is channel `c` at sample `t`. `channels[c]` names it. Both are length 32; each channel is 8064 samples.

### `trial_no` vs `experiment_id`

These are not the same and confusing them will scramble your stimulus mapping.

- **`trial_no`** (0–39) — presentation order. Randomised per participant, so trial 0 is a *different video* for every subject.
- **`experiment_id`** (1–40) — the video itself. Stable across all 32 participants.

Participant 7's trial 0 was experiment 17. Join on `experiment_id`, never `trial_no`.

---

## Channel order

Standard DEAP 32-channel layout, left hemisphere then right:

```
Fp1  AF3  F3   F7   FC5  FC1  C3   T7
CP5  CP1  P3   P7   PO3  O1   Oz   Pz
Fp2  AF4  Fz   F4   F8   FC6  FC2  Cz
C4   T8   CP6  CP2  P4   P8   PO4  O2
```

---

## Usage

```python
import json
import numpy as np

d = json.load(open("s07_ema.json"))
trial = d["trials"][0]

sig = np.array(trial["samples"])          # (32, 8064)
print(trial["experiment_id"])             # 17
```

### Normalising for a renderer

```python
lo = sig.min(axis=1, keepdims=True)
hi = sig.max(axis=1, keepdims=True)
glow = (sig - lo) / (hi - lo + 1e-10)     # (32, 8064), all in [0, 1]
```

Scale **per channel**, not globally — one hot electrode would otherwise wash out the other 31.

### Downsampling

8064 frames is far more than an animation needs. Every 4th sample gives 32 fps:

```python
frames = glow[:, ::4].T                   # (2016, 32) — rows are time
```

---

## Caveats

**The YouTube links don't line up with the EEG.** DEAP showed a **60-second excerpt** of each music video, chosen during an online screening as the most emotionally salient minute. The links point to the full track — often four minutes or more — and the start offset of the excerpt was never published. Treat the link as *which song was playing*, not as something you can play in sync.

**Many links are dead.** The dataset is from 2012. This blocks nothing: the signals and labels are self-contained. The links only matter if you want to extract acoustic features from the stimuli, and even then, artist and title are in `s07_stimuli.csv`.

**Brightness is not focus.** This pipeline measures signal amplitude, not attention or emotion. Amplitude alone can't separate "concentrating" from "drowsy" — a relaxed brain in strong alpha can read *higher* than an alert one. Label any visual built on this as **activity** or **signal intensity**. For an emotion figure, use the self-reported ratings (valence, arousal, dominance, liking) from `participant_ratings.xls`, which are real labels rather than a derived proxy.

---

## Reproducing

```python
import numpy as np

sig = eeg[trial, :32, :]                          # (32, 8064), from s07.dat
env = np.abs(sig)

tau   = 1.0
alpha = 1 - np.exp(-1 / (tau * 128))

ema = np.zeros_like(env)
ema[:, 0] = env[:, 0]
for i in range(1, env.shape[1]):
    ema[:, i] = alpha * env[:, i] + (1 - alpha) * ema[:, i - 1]
```

The loop is a first-order IIR filter, so `scipy.signal.lfilter([alpha], [1, -(1 - alpha)], env, axis=-1)` produces the same result far faster. The explicit version is kept here because it *is* the formula, and it reads that way.

---

## Source

Koelstra et al., *DEAP: A Database for Emotion Analysis using Physiological Signals*, IEEE Transactions on Affective Computing, 2012.