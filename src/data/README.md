# DEAP s07 — EMA-smoothed EEG

Envelope-smoothed EEG for **participant 7** of the DEAP dataset, prepared as a driver signal for a 3D electrode visualisation (32 bulbs on a head model, brightness following brain activity). Each trial also carries a per-second **focus** score — a frontal engagement index — for a live focus readout in the UI.

> **This is derived data, not DEAP itself.** The raw dataset is licensed and must be obtained from the [original source](https://www.eecs.qmul.ac.uk/mmv/datasets/deap/) under its EULA. Nothing here redistributes the raw recordings.

---

## What's in here

| File | Shape | Description |
|---|---|---|
| `s07_ema.json` | 40 trials × 32 ch × 8064 | All trials, EMA-smoothed, with stimulus metadata + per-trial `focus` (63) and `focus_avg` |
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

## Focus metric

Separate from the glow signal, each trial carries a **focus** score: one value per second, `0–1`, driving a live focus readout in the UI.

Brightness (above) is signal amplitude and can't tell concentration from drowsiness. Focus is derived differently — from the *frequency content* of the raw EEG, not the smoothed envelope.

**Engagement index.** For each 1-second window, the raw signal is transformed to the frequency domain (FFT) and power is summed in three bands: theta (4–8 Hz), alpha (8–13 Hz), beta (13–30 Hz). The score is the ratio

```
engagement = beta / (alpha + theta)
```

This index originates with **Pope, Bogart & Bartolome (1995)** [1], who evaluated several candidate indices in a closed-loop attention-monitoring task and found that `beta / (alpha + theta)` tracked task engagement best. The premise is that beta activity rises with alertness and cognitive engagement, while alpha and theta rise as alertness drops — so their ratio moves with engagement.

**Why this counts as "focus."** The index is widely used as a proxy for sustained attention. **Berka et al. (2007)** [2] showed it correlates with sustained attention, information gathering, and visual scanning, and later work (e.g. Freeman, Mikulka et al.) reinforced its link to alertness and focused attention. It's the standard EEG-derived stand-in for "how engaged/attentive is this person right now" — which is what the UI labels *focus*. (See the scope note below: it remains a proxy, not a direct measurement of attention.)

**Frontal-weighted.** Only the electrodes over the prefrontal cortex — the region tied to attention — feed the score: `Fp1 Fp2 AF3 AF4 F3 F4 Fz`. Averaging all 32 would dilute it with occipital and parietal channels unrelated to focus.

**Computed from raw EEG.** The FFT runs on the raw signal, *not* the rectified + EMA-smoothed `samples`. Smoothing the envelope destroys the band structure the metric depends on, so glow and focus are derived from the same source signal by two independent paths.

### Deliberate choices (focus)

- **Per-trial normalisation.** Each trial's 63 values are min-max scaled to `0–1` independently. So `0.0` is the least-focused *second within that trial* and `1.0` the most — not an absolute level. Scores are **not comparable across trials**; every trial spans the full `0–1` range regardless of how engaging it was.
- **`focus_avg`** is the mean of a trial's 63 values — a headline summary, carrying the same per-trial-relative caveat.
- **Full 63 s.** Baseline included, matching the glow signal.

> **A note on scope.** This reintroduces frequency-domain features that the time-domain pipeline otherwise avoids. It is a *proxy* — EEG band-power engagement is not a validated measure of focus. Label it accordingly in any figure.

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
      "samples": [[2.026, 2.041, "..."], "..."],
      "focus": [0.033, 0.2286, 0.5466, "..."],
      "focus_avg": 0.312
    }
  ]
}
```

`samples[c][t]` is channel `c` at sample `t`. `channels[c]` names it. Both are length 32; each channel is 8064 samples.

`focus[s]` is the frontal engagement index for second `s` (length 63, `0–1`). `focus_avg` is the trial mean. See [Focus metric](#focus-metric) for the per-trial normalisation caveat.

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

focus = np.array(trial["focus"])          # (63,) one per second, 0–1
print(trial["focus_avg"])                 # trial-mean focus
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

**Brightness is not focus.** The *glow* (`samples`) measures signal amplitude, not attention or emotion. Amplitude alone can't separate "concentrating" from "drowsy" — a relaxed brain in strong alpha can read *higher* than an alert one. Label any visual built on the glow as **activity** or **signal intensity**. The `focus` field is a separate, frequency-based engagement proxy (see [Focus metric](#focus-metric)) — better founded than amplitude, but still a proxy, not a validated focus measurement. For an emotion figure, use the self-reported ratings (valence, arousal, dominance, liking) from `participant_ratings.xls`, which are real labels rather than a derived proxy.

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

**Focus** is derived separately, from the raw signal:

```python
import numpy as np

FS = 128
FRONTAL = ["Fp1", "Fp2", "AF3", "AF4", "F3", "F4", "Fz"]
frontal = [CHANNELS.index(c) for c in FRONTAL]
BANDS = {"theta": (4, 8), "alpha": (8, 13), "beta": (13, 30)}

def focus_series(trial_eeg):              # trial_eeg: (32, 8064) raw
    out = np.zeros(63)
    for f in range(63):
        seg = trial_eeg[:, f*FS:(f+1)*FS]
        theta = alpha = beta = 0.0
        for ch in frontal:
            x = seg[ch] - seg[ch].mean()
            p = np.abs(np.fft.rfft(x))**2
            hz = np.fft.rfftfreq(len(x), 1/FS)
            theta += p[(hz>=4)&(hz<8)].sum()
            alpha += p[(hz>=8)&(hz<13)].sum()
            beta  += p[(hz>=13)&(hz<30)].sum()
        out[f] = beta / (alpha + theta) if (alpha+theta) else 0.0
    lo, hi = out.min(), out.max()
    return (out - lo) / (hi - lo) if hi > lo else np.zeros(63)
```

---

## Source

Koelstra et al., *DEAP: A Database for Emotion Analysis using Physiological Signals*, IEEE Transactions on Affective Computing, 2012.

### Focus metric references

[1] Pope, A. T., Bogart, E. H., & Bartolome, D. S. (1995). *Biocybernetic system evaluates indices of operator engagement in automated task.* Biological Psychology, 40(1–2), 187–195. — origin of the `beta / (alpha + theta)` engagement index.

[2] Berka, C., et al. (2007). *EEG correlates of task engagement and mental workload in vigilance, learning, and memory tasks.* Aviation, Space, and Environmental Medicine, 78(5), B231–B244. — validates the index against sustained attention and information gathering.