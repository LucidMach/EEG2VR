import { createXRStore } from "@react-three/xr";

// Singleton: shared between the <XR> canvas wrapper and the sidebar's
// "Enter VR"/"Enter AR" buttons, which live in different modules.
export const xrStore = createXRStore({
  depthSensing: false,
});
