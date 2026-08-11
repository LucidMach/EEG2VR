// R3F's synthetic pointer event `target` isn't always a DOM element (varies
// by backend), so capture/release are done defensively via optional chaining
// rather than assuming setPointerCapture exists.
export function capturePointer(e: { target: unknown; pointerId: number }): void {
  (e.target as { setPointerCapture?: (id: number) => void } | null)?.setPointerCapture?.(e.pointerId);
}

export function releasePointer(e: { target: unknown; pointerId: number }): void {
  (e.target as { releasePointerCapture?: (id: number) => void } | null)?.releasePointerCapture?.(e.pointerId);
}
