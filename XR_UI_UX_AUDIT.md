# XR UI/UX Comprehensive Audit Report

**Application:** BrainXR / EEG Digital Twin (WebXR Spatial Interface)  
**Date:** August 25, 2026  
**Audited Subsystems:** Scene, Head Placement, Spatial Console, Canvas Dashboard Texture, 3D Mesh Interaction  
**Target Hardware:** Meta Quest 2 / 3 / Pro, Apple Vision Pro, Pico 4, WebXR Desktop Emulators  
**Primary Files Evaluated:**
- [`src/components/Scene.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/Scene.tsx)
- [`src/components/HeadWrapper/index.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/HeadWrapper/index.tsx)
- [`src/components/HeadWrapper/useHeadPlacement.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/HeadWrapper/useHeadPlacement.ts)
- [`src/components/HeadWrapper/useXRDragInteraction.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/HeadWrapper/useXRDragInteraction.ts)
- [`src/components/XRConsole/index.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/index.tsx)
- [`src/components/XRConsole/ConsolePanel.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/ConsolePanel.tsx)
- [`src/components/XRConsole/IdleActionsXR.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/IdleActionsXR.tsx)
- [`src/components/XRConsole/XRDashboard/XRDashboardMesh.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/XRDashboardMesh.tsx)
- [`src/components/XRConsole/XRDashboard/useXRDashboardTexture.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/useXRDashboardTexture.ts)
- [`src/components/XRConsole/XRDashboard/useXRDashboardInteraction.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/useXRDashboardInteraction.ts)
- [`src/components/XRConsole/XRDashboard/renderDashboard.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/renderDashboard.ts)
- [`src/components/XRConsole/XRDashboard/drawHeader.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawHeader.ts)
- [`src/components/XRConsole/XRDashboard/drawFocusDial.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawFocusDial.ts)
- [`src/components/XRConsole/XRDashboard/drawChannelTelemetry.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawChannelTelemetry.ts)
- [`src/components/XRConsole/XRDashboard/drawOscilloscopes.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawOscilloscopes.ts)
- [`src/components/XRConsole/XRDashboard/drawTrialTimeline.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawTrialTimeline.ts)
- [`src/components/XRConsole/XRDashboard/drawTimelineSegment.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawTimelineSegment.ts)
- [`src/components/XRConsole/XRDashboard/drawPointerReticle.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawPointerReticle.ts)
- [`src/components/eegHead/index.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/eegHead/index.tsx)
- [`src/components/eegHead/ElectrodeNode.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/eegHead/ElectrodeNode.tsx)

---

## 1. Executive Summary & UX Maturity Scorecard

The WebXR implementation of BrainXR delivers high-density neuromonitoring into immersive 3D space, translating 21-channel EEG oscilloscopes, affective metrics (valence/arousal), focus gauges, and multi-trial timelines into a spatial dashboard positioned alongside an interactive digital twin.

While the foundation is technically sound, this audit identifies critical **ergonomic friction**, **micro-target interaction barriers (Fitts's Law)**, **spatial control conflicts**, and **visual legibility challenges** under typical VR headset optics.

```
========================================================================================
                                 XR UX MATURITY MATRIX
========================================================================================
[Spatial Ergonomics & Comfort]      ██████████████░░░░░░  7.0 / 10 (Good Distance / Hard Anchor)
[VR Typography & Legibility]        ██████████░░░░░░░░░░  5.0 / 10 (Sub-12px Bitmap Text Aliasing)
[Interaction Fidelity & Targets]    █████████░░░░░░░░░░░  4.5 / 10 (8.2mm Targets / Grab Conflict)
[Multimodal Sensory Feedback]       ██████░░░░░░░░░░░░░░  3.0 / 10 (Zero Haptics / Audio Feedback)
[Visual Continuity & Theming]       ████████████░░░░░░░░  6.0 / 10 (White Glare / Phase Jumps)
[Performance & Texture Budget]      ███████████████░░░░░  7.5 / 10 (30Hz Throttle / VRAM Bandwidth)
========================================================================================
```

---

## 2. Deep-Dive Audit by Spatial Dimension

### 2.1 Spatial Ergonomics, Viewing Distances & Posture

```
                                  [Eye Level y = 1.6m]
                                          o   <--- User Headset
                                         /|\
                                         / \
                                          |
                      +-------------------+-------------------+
                      | Distance: 1.10m                       |
                      v                                       v
         [Digital Twin Head]                         [XRDashboard Panel]
         Position: (0, 1.30m, -1.10m)                Position: (0, 0.72m, -1.05m)
         Scale: 0.012 (22cm Head)                    Tilt: -36° upward (-π/5)
         Interaction: 6DoF Ray Drag                  Width: 0.96m x 0.62m
```

#### Strengths
1. **Target in Primary Comfort Zone**: The digital twin at $1.10\text{ m}$ sits squarely inside the standard **Action Space** ($0.75\text{ m} - 1.50\text{ m}$), avoiding near-field vergence-accommodation conflict ($< 0.50\text{ m}$) and far-field pixelation ($> 2.50\text{ m}$).
2. **Natural Gaze Inclination**: The dashboard at $y = 0.72\text{ m}, z = -1.05\text{ m}$ with a $-36^\circ$ ($-\frac{\pi}{5}$) upward tilt aligns closely with the human resting neck inclination of $15^\circ - 35^\circ$ (the natural "podium / desk" posture).

#### Failure Modes & Risks
1. **Spatial Anchor Decoupling**:
   - In [`useXRDragInteraction.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/HeadWrapper/useXRDragInteraction.ts#L28-L83), users can freely drag and reposition the digital twin in 3D space.
   - However, the dashboard position is statically hardcoded at world coordinates `[0, 0.72, -1.05]`.
   - **Consequence**: If a user drags the head sideways or rotates around to inspect occipital/parietal channels, the dashboard remains stationary behind them or occludes the view.
2. **Spatial Geometry Clipping**:
   - The head center sits at $z = -1.10\text{ m}$ with a bounding radius of $\approx 0.12\text{ m}$, reaching forward to $z = -0.98\text{ m}$.
   - The dashboard top edge sits at $z = -1.05\text{ m}$.
   - Dragging the head forward/downward immediately causes 3D skull geometry to clip through the dashboard plane.

---

### 2.2 Legibility, Angular Resolution & VR Optics

```
+------------------------------------------------------------------------------------+
|  VR Display Lens (Quest 2/3 / Vision Pro / Pico 4 Optics)                         |
|  Panel: 0.96m wide @ 1.05m distance ≈ 49° Horizontal FOV. Canvas: 1400px x 900px. |
|  Resulting Spatial Density: 1400px / 49° ≈ 28.5 Pixels Per Degree (PPD)           |
|                                                                                    |
|  Current Font Sizes: 9px - 10px monospace ≈ 4.8 - 5.4 arcminutes                  |
|  Spatial Design Standard: MINIMUM 14 - 16 arcminutes (Ideal: 20+ arcminutes)       |
+------------------------------------------------------------------------------------+
```

#### Critical Findings
1. **Sub-Threshold Font Sizes on 2D Texture**:
   - Header Demo badge: `10px monospace` ($\approx 5.4\text{ arcminutes}$) in [`drawHeader.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawHeader.ts#L30)
   - Phase Pill text: `11px monospace` ($\approx 5.9\text{ arcminutes}$) in [`drawHeader.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawHeader.ts#L57)
   - Dial Milestone markers: `9px monospace` ($\approx 4.8\text{ arcminutes}$) in [`drawFocusDial.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawFocusDial.ts#L43)
   - Dial Average metric: `10px monospace` ($\approx 5.4\text{ arcminutes}$) in [`drawFocusDial.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawFocusDial.ts#L83)
   - Channel labels on oscilloscopes: `10px monospace` in [`drawOscilloscopes.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawOscilloscopes.ts#L49)
   - **Impact**: Under Fresnel and pancake lenses with text compression and display chromatic aberration, sub-12px monospace text appears severely pixelated and unreadable without leaning uncomfortably forward.
2. **Missing Anisotropic Filtering on Tilted Canvas**:
   - In [`useXRDashboardTexture.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/useXRDashboardTexture.ts#L40-L45), the canvas texture uses `THREE.LinearFilter` without mipmaps and with default `anisotropy = 1`.
   - Because the dashboard is viewed at an oblique $36^\circ$ angle, high-frequency text and gridlines shimmer and blur without `texture.anisotropy = 4` or `8`.

---

### 2.3 Interaction Fidelity, Target Sizing & Fitts's Law

#### Critical Findings
1. **Extreme Micro-Targets on 40-Trial Timeline**:
   - In [`drawTimelineSegment.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawTimelineSegment.ts#L51-L90), 40 trials are packed into a $1360\text{px}$ track width.
   - Each inactive trial segment width is $\approx 25.6\text{px}$ on canvas.
   - Converted to physical dimensions: $\frac{25.6\text{px}}{1400\text{px}} \times 0.96\text{ m} = \mathbf{8.2\text{ mm}}$ ($\approx 0.45^\circ$ visual angle).
   - Baseline circular hit dot: $\text{radius } 4\text{px} \to \text{width } 12\text{px} = \mathbf{8.2\text{ mm}}$.
   - **Violation of Spatial Fitts's Law**: VR laser ray selection requires a minimum target size of **$32\text{ mm} - 48\text{ mm}$** ($\approx 2.5^\circ - 3.0^\circ$ visual arc) to accommodate natural physiological hand tremor and ray angle magnification. Trying to hit a specific 8mm dot at 1 meter distance leads to high miss rates and user frustration.
2. **Missing Interactive Hit Areas in Render Pipeline**:
   - In [`useXRDashboardInteraction.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/useXRDashboardInteraction.ts#L54-L60), click logic is programmed to handle:
     - `match.type === "play-pause"`
     - `match.type === "speed"`
   - However, in [`drawHeader.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawHeader.ts#L81-L90), the speed badge is drawn visually, but **`hitAreas.push(...)` is never called** for `speed` or `play-pause`. Clicking the speed/pause indicator in VR produces zero reaction.
3. **Control Ambiguity: Model Drag vs. LED Channel Selection**:
   - In [`HeadWrapper/index.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/HeadWrapper/index.tsx#L60-L72), the parent group wraps `EEGHead` with `handlePointerDown` from `useXRDragInteraction`.
   - In [`ElectrodeNode.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/eegHead/ElectrodeNode.tsx#L34-L38), each LED sensor listens to `onClick`.
   - **Problem**: When a user aims the ray at an LED (e.g. Cz or Fp1) and pulls the controller trigger, `onPointerDown` on the parent group fires immediately, capturing the pointer and initiating head-drag mode. Any minor hand movement before trigger release transforms the intended LED selection into an unintended head drag.

---

### 2.4 Multimodal Feedback (Haptics, Audio & Hover States)

#### Findings
1. **Absence of Haptic Confirmation**:
   - WebXR provides access to controller haptic pulse actuators (`XRInputSource.gamepad.hapticActuators[0].pulse(intensity, duration)`).
   - Currently, hovering over buttons, selecting timeline trials, or grasping the 3D model triggers zero haptic sensation.
2. **Missing Visual State Changes on Canvas Elements**:
   - While [`drawPointerReticle.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawPointerReticle.ts#L1-L57) renders a 2D crosshair at `hoverUv`, the interactive buttons (Exit XR, timeline segments, play controls) do not brighten, elevate, or show hover state outlines.
3. **Cursor Duplication & Depth Conflict**:
   - `@react-three/xr` renders a standard 3D ray with a contact dot in world space.
   - `drawPointerReticle` simultaneously paints a 2D crosshair flat onto the canvas texture.
   - This creates a double-cursor visual artifact that causes binocular stereoscopic disparity rivalry.

---

### 2.5 Visual Hierarchy, Lighting & Phase Continuity

```
========================================================================================
                              PHASE ARCHITECTURE GAP
========================================================================================
[Phase: "idle"]             [Phase: "quality-check"]     [Phase: "stimulus" / "baseline"]
IdleActionsXR.tsx           ConsolePanel.tsx             XRDashboard.tsx
• Floating 3D dark pills    • Stark white 3D text box    • 2D Canvas on glass plane
• Minimalist spatial CTA    • No waveforms or dial       • Oscilloscopes, Dial, Timeline
========================================================================================
```

#### Findings
1. **Fragmented UI Paradigms Across Phases**:
   - In [`XRConsole/index.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/index.tsx#L40-L72), each phase unmounts the previous component and mounts an entirely different visual language.
   - The transition from `idle` $\to$ `quality-check` $\to$ `demo/stimulus` feels abrupt and disconnected.
2. **Excessive Glare in Dark / Pass-Through XR Modes**:
   - The dashboard utilizes a solid white `#ffffff` / `#f8fafc` background with a glass border.
   - In VR/AR environments, large high-luminance white slabs cause pupil constriction and lens glare. A sleek dark glassmorphic design (`#0f172a` Slate-900 surface with luminous `#38bdf8` cyan and `#34d399` emerald waveforms) delivers better visual depth and optical comfort.
3. **Low Contrast Ratios**:
   - In [`drawFocusDial.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawFocusDial.ts#L34), dial tick marks use `#cbd5e1` on `#ffffff` ($\approx 1.4:1$ contrast ratio), rendering them virtually invisible in headset displays.

---

### 2.6 Performance, Frame Budget & Texture Bandwidth

#### Findings
1. **VRAM Upload Overhead**:
   - In [`useXRDashboardTexture.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/useXRDashboardTexture.ts#L54-L84), a $1400 \times 900$ RGBA texture is uploaded to GPU memory via `texture.needsUpdate = true` at $30 - 40\text{ Hz}$ ($1400 \times 900 \times 4\text{ bytes} \approx 5.04\text{ MB}$ per upload $\approx 150 - 200\text{ MB/s}$ memory transfer).
   - On standalone XR hardware (e.g. Meta Quest Snapdragon XR2), heavy continuous texture streaming on the main render thread can cause micro-stutters in 90Hz/120Hz display modes.
2. **Redundant Repaints**:
   - Canvas repaints continue at $30\text{ Hz}$ even when playback is paused or static.

---

### 2.7 Onboarding & WebXR Launch Flow

#### Findings
1. **Missing 2D-to-VR Launch Entry Point**:
   - [`xrStore.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/utils/xrStore.ts#L5) instantiates `@react-three/xr`.
   - However, neither [`TopHudBar.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/r3f/TopHudBar.tsx) nor [`IdleSplash.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/IdleSplash.tsx) renders an "Enter VR" or "Enter AR" button.
   - Users opening the web application inside a headset browser have no visible button to launch into immersive mode.

---

## 3. Comprehensive Issue & Bug Matrix

| ID | Severity | Category | Issue Description | Affected Files |
| :--- | :---: | :---: | :--- | :--- |
| **XR-01** | 🔴 **High** | Interaction | 40-trial timeline hit areas are $\approx 8.2\text{ mm}$ wide ($0.45^\circ$), violating 3D Fitts's Law. | [`drawTimelineSegment.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawTimelineSegment.ts#L51) |
| **XR-02** | 🔴 **High** | Interaction | Speed and Play/Pause hit areas missing from `hitAreas` in `drawHeader.ts`. | [`drawHeader.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawHeader.ts#L81) |
| **XR-03** | 🔴 **High** | Interaction | Model grab on parent group conflicts with LED sensor clicks on `ElectrodeNode`. | [`HeadWrapper/index.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/HeadWrapper/index.tsx#L60), [`useXRDragInteraction.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/HeadWrapper/useXRDragInteraction.ts#L28) |
| **XR-04** | 🔴 **High** | Legibility | Sub-12px monospace text ($\approx 5\text{ arcminutes}$) aliases and blurs in VR optics. | [`drawHeader.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawHeader.ts#L30), [`drawFocusDial.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawFocusDial.ts#L43), [`drawOscilloscopes.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawOscilloscopes.ts#L49) |
| **XR-05** | 🟡 **Medium** | Ergonomics | Static world placement of dashboard decouples when user moves digital twin. | [`XRDashboardMesh.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/XRDashboardMesh.tsx#L23) |
| **XR-06** | 🟡 **Medium** | Visual | Tilted canvas texture lacks anisotropic filtering, causing blur on angled text. | [`useXRDashboardTexture.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/useXRDashboardTexture.ts#L40) |
| **XR-07** | 🟡 **Medium** | Accessibility | High-luminance white slab background causes glare in dark virtual spaces. | [`renderDashboard.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/renderDashboard.ts#L19) |
| **XR-08** | 🟡 **Medium** | Architecture | Phase transition discontinuity (`IdleActionsXR` $\to$ `ConsolePanel` $\to$ `XRDashboard`). | [`XRConsole/index.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/index.tsx#L40) |
| **XR-09** | 🟡 **Medium** | Feedback | Zero controller haptic feedback on button hover, click, or model grab. | [`useXRDashboardInteraction.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/useXRDashboardInteraction.ts#L34) |
| **XR-10** | 🔵 **Low** | Launch Flow | 2D HUD lacks a visible "Enter VR" button calling `xrStore.enterVR()`. | [`TopHudBar.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/r3f/TopHudBar.tsx) |

---

## 4. Strategic Remediation & Design Recommendations

### Phase 1: Immediate Critical Fixes (Interaction & Legibility)

#### 1.1 Redesign the VR Trial Timeline for Spatial Interaction
Instead of 40 individual sub-centimeter slices, introduce a spatial timeline architecture:
- **Continuous Scrubber with Step Controls**:
  - Add dedicated **[◀ Previous Trial]** and **[Next Trial ▶]** buttons ($64\text{px} \times 36\text{px}$ on canvas $\approx 44\text{ mm}$ wide).
  - Expand the active scrubber track to a generous $24\text{px}$ height with an oversized grab handle ($28\text{px}$ radius).
  - Show a floating tooltip showing target trial number above the reticle while hovering over the track.

#### 1.2 Wire Missing Hit Areas in Header
Update [`drawHeader.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/drawHeader.ts) to push hit targets:
```ts
// In drawHeader.ts
hitAreas.push({
  id: "speed-toggle",
  type: "speed",
  x: rightX - 75,
  y: 15,
  width: 75,
  height: 26,
});

hitAreas.push({
  id: "play-pause-toggle",
  type: "play-pause",
  x: pillX,
  y: pillY,
  width: pillWidth,
  height: pillHeight,
});
```

#### 1.3 Disambiguate Head Drag vs. Electrode Node Click
Introduce a drag displacement deadzone threshold in [`useXRDragInteraction.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/HeadWrapper/useXRDragInteraction.ts):
```ts
// Only commit to head relocation if pointer moved beyond threshold (e.g. 0.03m)
const DRAG_THRESHOLD = 0.03; // 3cm movement in world space
if (!hasExceededThresholdRef.current) {
  const movement = dragStartRayOrigin.distanceTo(e.ray.origin);
  if (movement < DRAG_THRESHOLD) return; // Keep click active for ElectrodeNode
  hasExceededThresholdRef.current = true;
}
```
Or provide a dedicated 3D grab ring/pedestal under the head for manipulation, leaving the sensor dome dedicated to channel selection.

#### 1.4 Upscale Typography & Enable Anisotropic Filtering
- **Minimum Canvas Font Guidelines**:
  - Primary Telemetry & Readouts: `36px - 48px`
  - Headers, Channel Names & Actions: `18px - 24px bold`
  - Descriptions & Secondary Metrics: `14px - 16px`
- **Enable Anisotropy in Texture Init**:
  ```ts
  // In useXRDashboardTexture.ts
  texture.anisotropy = 4;
  texture.generateMipmaps = false;
  ```

---

### Phase 2: Ergonomic & Sensory Polish

#### 2.1 Dynamic Dashboard Lazy-Follow (Billboarding & Anchoring)
Instead of static world coordinates, anchor the dashboard to the user's view or head group with a lazy spring constraint:
- If the digital twin is moved, smoothly interpolate the dashboard to maintain a comfortable $45\text{cm}$ offset below the model.
- Provide a subtle **"Recenter"** button on the console to quickly snap all spatial elements directly in front of the user's current gaze.

#### 2.2 Implement WebXR Controller Haptics
In [`useXRDashboardInteraction.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/useXRDashboardInteraction.ts):
```ts
export function triggerXRHaptic(e: ThreeEvent<PointerEvent>, intensity = 0.4, duration = 15) {
  const nativeEvent = e.nativeEvent as any;
  const inputSource = nativeEvent?.data?.inputSource;
  const gamepad = inputSource?.gamepad;
  if (gamepad?.hapticActuators?.[0]) {
    gamepad.hapticActuators[0].pulse(intensity, duration);
  }
}
```
Trigger a subtle $10\text{ms}$ pulse on button hover, and a crisp $25\text{ms}$ pulse on click.

#### 2.3 Transition to Dark Glassmorphic Theme for XR
Invert the canvas palette to eliminate VR glare:
- **Background Base**: `#090d16` (Deep Obsidian) with `#131b2e` card panels.
- **Card Borders**: `rgba(255, 255, 255, 0.08)` subtle glass edge.
- **Waveform Traces**: Vibrant `#38bdf8` (Cyan), `#34d399` (Emerald), `#a78bfa` (Purple) with high luminescence.
- **Typography**: `#f8fafc` (Primary White) and `#94a3b8` (Slate-400).

---

### Phase 3: Spatial UX Unification

#### 3.1 Unify the Console Across All Phases
Deprecate the legacy [`ConsolePanel.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/ConsolePanel.tsx). Use [`XRDashboard.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRDashboard/index.tsx) across both `quality-check` and `demo/live` modes:
- In `quality-check`, render an electrode impedance/connectivity matrix in place of the trial timeline.
- In `baseline`/`stimulus`, render full multi-channel oscilloscopes and affective metrics.

#### 3.2 Add "Enter VR" WebXR Launch Control to 2D HUD
In [`TopHudBar.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/r3f/TopHudBar.tsx) and [`IdleSplash.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/IdleSplash.tsx), render an "Enter XR" button when WebXR is supported:
```tsx
<button
  onClick={() => xrStore.enterVR()}
  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg transition-all"
>
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 7H3a2 2 0 00-2 2v6a2 2 0 002 2h4l2 2h6l2-2h4a2 2 0 002-2V9a2 2 0 00-2-2z..." />
  </svg>
  Enter VR
</button>
```

---

## 5. Summary & Next Steps

This audit outlines the primary pathways to elevate BrainXR from a prototype spatial console to a commercial-grade, ergonomically comfortable WebXR application. Implementing the Tier 1 fixes (VR target sizing, font scaling, hit area registration, and drag-click disambiguation) will immediately resolve the most pressing usability hurdles.
