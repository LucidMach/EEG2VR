# WebXR Dashboard UI Redesign Implementation Plan

Redesign the WebXR spatial dashboard interface according to the user requirements and the [XR UI/UX Comprehensive Audit Report](file:///Users/lucidmach/Monash/MNET/EEG2VR/XR_UI_UX_AUDIT.md).

---

## Architecture Overview

```
                      +---------------------------------------+
                      |   Immersive Cylindrical Sensor Wall   |
                      |   (21-Channel Oscilloscopes Arena)    |
                      |   Radius: 3.5m, Height: 2.2m, Arc: ~160°|
                      +-------------------+-------------------+
                                          |
                                          |
                      +-------------------+-------------------+
                      |             Eye Level                 |
                      |                 o                     |
                      |                /|\                    |
                      +-----------------+---------------------+
                                        |
         +------------------------------+------------------------------+
         |                                                             |
         v                                                             v
+--------------------------------+                            +-------------------------------+
|  Digital Twin Headset (3D)     |                            | Left Hand Smartwatch          |
|  Position: [0, 1.3m, -1.1m]    |                            | Attached to Left Wrist/Grip   |
|                                |                            | (with floating FOV fallback)  |
|  [Spatial Control Bar (Under)] |                            |                               |
|  • Current Trial: "12 of 40"   |                            | • Circular Focus Dial Gauge   |
|  • [◀ Prev Trial] Button       |                            | • Focus % & Running Avg %     |
|  • [⏸ Pause / ▶ Play] Button   |                            | • 40-Trial Milestone Ring     |
|  • [ 1X ] & [ 10X ] Buttons    |                            | • Valence & Arousal Chips     |
|  • [ Next Trial ▶ ] Button     |                            | • Phase Indicator Badge       |
|  • [ ✕ Exit XR ] Button        |                            +-------------------------------+
+--------------------------------+
```

---

## User Review Required

> [!IMPORTANT]
> **Spatial Layout Decisions**:
> 1. **Cylinder Wall**: Curved panoramic cylinder display (radius 3.5m, height 2.2m, 160° arc around user gaze) rendering the 21-channel EEG oscilloscopes with region colors, baseline dashed/stimulus solid waves, and ray-pointer channel selection.
> 2. **Trial Control Pod**: Positioned directly below the digital twin head ($y \approx 0.88\text{m}, z \approx -1.05\text{m}$, tilted up $-25^\circ$), featuring large Fitts's-law-compliant buttons (44mm+ width) for `[◀ Prev Trial]`, `[⏸ Pause]`, `[1X]`, `[10X]`, `[Next Trial ▶]`, and current trial telemetry.
> 3. **Focus Metrics Watch**: Positioned on the user's left hand / wrist via `@react-three/xr` joint tracking (`XRSpace`/joint or controller grip), with a comfortable floating fallback in the lower-left comfort zone if hands/controllers are not actively tracked.
> 4. **Optical & Sensory Polish**: Anisotropic texture filtering (`anisotropy = 8`), dark glassmorphic styling to eliminate lens glare, and controller haptics on hover/click.

---

## Proposed Changes

### Component 1: Immersive Cylindrical Sensor Wall

Create a curved cylindrical display surrounding the user that displays the live 21-channel sensor node output with region color coding and ray interactivity.

#### [NEW] [`src/components/XRConsole/XRCylinderWall/index.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRCylinderWall/index.tsx)
- Renders the 3D cylinder geometry (`radiusTop: 3.5, radiusBottom: 3.5, height: 2.2, thetaLength: Math.PI * 0.9`) facing the user.
- Handles ray pointer interactions: hovering highlights channel lanes, clicking selects an electrode channel (`onChannelSelect(name)`) and triggers haptic pulses.

#### [NEW] [`src/components/XRConsole/XRCylinderWall/useXRCylinderTexture.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRCylinderWall/useXRCylinderTexture.ts)
- Manages an offscreen 2D canvas ($2048 \times 1024$ px) texture with `texture.anisotropy = 8`.
- Drives a 30Hz throttled repaint loop reading `historiesRef`, `frameRef`, and `selectedChannel`.

#### [NEW] [`src/components/XRConsole/XRCylinderWall/renderCylinderWall.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRCylinderWall/renderCylinderWall.ts)
- Draws the panoramic neural command center:
  - Header: "NEURAL TELEMETRY ARENA · 21-CHANNEL EEG" + live status.
  - 21 channel oscilloscope lanes color-coded by region (`REGION_RGBA` from [regionColors.ts](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/BackgroundOscilloscopes/regionColors.ts)).
  - Dashed baseline / solid stimulus wave lines, microvolt amplitude labels, and channel badges.
  - Highlight glow on selected channel lane with real-time $\mu\text{V}$ readout.

---

### Component 2: Spatial Trial Control Bar (Below Headset)

Create the floating spatial control bar under the digital twin head with current trial info and a flex row of playback buttons.

#### [NEW] [`src/components/XRConsole/XRControlBar/index.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRControlBar/index.tsx)
- Anchored under the headset ($y \approx 0.88\text{m}, z \approx -1.05\text{m}$, tilted upward at $-25^\circ$).
- Top Status Row: Current trial counter ("TRIAL 12 OF 40"), phase pill ("BASELINE" / "STIMULUS"), time elapsed (`00:24 / 01:03`), and selected channel chip.
- Bottom Flex Row of 3D Interactive Buttons:
  - **`[ ◀ PREV TRIAL ]`**: Decrements trial index (disabled on trial 0).
  - **`[ ⏸ PAUSE / ▶ PLAY ]`**: Toggles playback engine pause state.
  - **`[ 1X ]`**: Sets speed to 1x (highlighted when active).
  - **`[ 10X ]`**: Sets speed to 10x (highlighted when active).
  - **`[ NEXT TRIAL ▶ ]`**: Increments trial index (disabled on trial 39).
  - **`[ ✕ EXIT XR ]`**: Exits WebXR session.
- Oversized hit boxes ($>44\text{mm}$ width), 3D button depression on hover, and haptic feedback.

---

### Component 3: Left Hand Focus Metrics Smartwatch

Create the wearable focus dial smartwatch attached to the left hand/wrist in WebXR.

#### [NEW] [`src/components/XRConsole/XRLeftWristWatch/index.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRLeftWristWatch/index.tsx)
- Uses `@react-three/xr` joint tracking (`XRSpace`/`XRHandJoint`/controller state) to position the watch precisely on the left wrist/forearm joint.
- Includes a smooth floating fallback anchor (`[-0.35, 1.1, -0.6]`) when hands/controllers are not actively in view or during desktop VR emulation.
- 3D watch chassis: dark brushed titanium casing, beveled glass dial, and mounting strap.

#### [NEW] [`src/components/XRConsole/XRLeftWristWatch/useWatchDialTexture.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/XRLeftWristWatch/useWatchDialTexture.ts)
- High-resolution circular OLED dial texture ($512 \times 512$ px, `anisotropy = 8`):
  - Central Focus Metric readout (`88%` bold text + `FOCUS` label + `[AVG: 74%]`).
  - Outer 40-trial circular milestone tick ring with rotating active trial pointer.
  - Valence & Arousal ratings pills (`VAL +0.6 · ARO 0.4`).
  - Neon Phase badge (`STIMULUS` emerald / `BASELINE` indigo).

---

### Component 4: Spatial Integration & Audit Hardening

#### [MODIFY] [`src/components/XRConsole/index.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/XRConsole/index.tsx)
- Unifies the XR scene: renders `XRCylinderWall`, `XRControlBar` (under headset), and `XRLeftWristWatch` (on left hand).
- Preserves idle mode options while providing consistent styling across all phases.

#### [MODIFY] [`src/components/HeadWrapper/useXRDragInteraction.ts`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/HeadWrapper/useXRDragInteraction.ts)
- Adds a small 3D movement deadzone threshold ($0.03\text{m}$) to disambiguate head dragging from electrode node clicks (resolves Audit XR-03).

#### [MODIFY] [`src/components/r3f/TopHudBar.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/r3f/TopHudBar.tsx) & [`src/components/IdleSplash.tsx`](file:///Users/lucidmach/Monash/MNET/EEG2VR/src/components/IdleSplash.tsx)
- Adds a visible "Enter VR" button calling `xrStore.enterVR()` on headsets/browsers supporting WebXR (resolves Audit XR-10).

---

## Verification Plan

### Automated Type & Build Checks
- Run `ASTRO_TELEMETRY_DISABLED=1 npx astro check` to ensure zero TypeScript/Astro diagnostics errors.
- Run `npx tsc --noEmit` to verify type safety across all Three.js and React components.

### Visual & Interactive Verification
- Verify that `XRCylinderWall` renders smoothly around the user without clipping.
- Verify that `XRControlBar` renders below the headset with the complete row of interactive buttons (`Prev Trial`, `Pause/Play`, `1x`, `10x`, `Next Trial`, `Exit XR`).
- Verify that `XRLeftWristWatch` renders the focus metrics, 40-trial tick dial, average focus, and valence/arousal chips on the left wrist (and gracefully falls back if hand/controller tracking is unavailable).
- Verify that clicking electrode nodes on the head or on the cylinder wall selects the channel and updates all telemetry in real time.
