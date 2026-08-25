import { createXRStore } from "@react-three/xr";

// WebXR Store configuration with high-visibility ray pointers and cursor models
export const xrStore = createXRStore({
  depthSensing: false,
  controller: {
    rayPointer: {
      minDistance: 0,
      rayModel: {
        maxLength: 10,
      },
      cursorModel: true,
    },
  },
  hand: {
    rayPointer: {
      minDistance: 0,
      rayModel: {
        maxLength: 10,
      },
      cursorModel: true,
    },
  },
});
