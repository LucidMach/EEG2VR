// Mock headset-connection flow: searching -> impedance check -> connected.
// Extracted for locality only. This is a single adapter (the mock) with no
// real headset adapter yet, so it stays a plain function rather than a
// port/interface — per architecture-review seam discipline, one adapter is a
// hypothetical seam, not a real one. Promote to a ConnectionFlow interface
// only once a real hardware adapter exists to justify the seam.

export interface ConnectionProgress {
  step: "searching" | "checking" | "connected";
  device?: string;
}

const MOCK_DEVICE_NAME = "Cyton 8-Ch Bluetooth Headset";
const SEARCH_DURATION_MS = 2000;
const IMPEDANCE_CHECK_DURATION_MS = 2500;

// Calls onProgress through the three steps on mock timers. Returns a cancel
// function that clears any timers not yet fired.
export function simulateHeadsetConnection(
  onProgress: (progress: ConnectionProgress) => void
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];

  onProgress({ step: "searching" });

  timers.push(
    setTimeout(() => {
      onProgress({ step: "checking" });

      timers.push(
        setTimeout(() => {
          onProgress({ step: "connected", device: MOCK_DEVICE_NAME });
        }, IMPEDANCE_CHECK_DURATION_MS)
      );
    }, SEARCH_DURATION_MS)
  );

  return () => timers.forEach(clearTimeout);
}
