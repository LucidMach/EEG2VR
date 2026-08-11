export const NUM_TRIALS = 40; // Always 40 trials on the dial as requested

// A 240 degree sweep from -120 to +120
export function getAngleForIndex(index: number): number {
  if (NUM_TRIALS <= 1) return 0;
  return -120 + index * (240 / (NUM_TRIALS - 1));
}

export function isMilestone(i: number): boolean {
  return i === 0 || i === 9 || i === 19 || i === 29 || i === 39;
}

export function getMilestoneLabel(i: number): string {
  if (i === 0) return "01";
  return String(i + 1);
}
