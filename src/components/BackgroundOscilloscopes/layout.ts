export interface LaneLayout {
  width: number;
  height: number;
  paddingTop: number;
  paddingLeft: number;
  drawWidth: number;
  laneHeight: number;
}

// Resizes the canvas backing store to match its CSS size at the current
// device pixel ratio, resets the transform/scale, and clears it. Returns the
// CSS-pixel width/height that all subsequent drawing should use.
export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): { width: number; height: number } {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const targetWidth = Math.floor(width * dpr);
  const targetHeight = Math.floor(height * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  ctx.resetTransform();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  return { width, height };
}

// Computes the horizontal lanes (one per electrode) within the padded
// drawing area, leaving room for the top/bottom HUD overlays.
export function computeLaneLayout(width: number, height: number, numElectrodes: number): LaneLayout {
  const paddingTop = 72; // Room for top header controls
  const paddingBottom = 96; // Room for bottom timeline controls
  const usableHeight = Math.max(100, height - paddingTop - paddingBottom);
  const laneHeight = usableHeight / numElectrodes;

  const paddingLeft = 56; // Room for name labels at the left margin
  const drawWidth = width - paddingLeft - 16; // Right margin buffer

  return { width, height, paddingTop, paddingLeft, drawWidth, laneHeight };
}

export function laneCenterY(layout: LaneLayout, idx: number): number {
  return layout.paddingTop + (idx + 0.5) * layout.laneHeight;
}
