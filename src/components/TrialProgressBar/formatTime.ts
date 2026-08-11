// Formats seconds as m:ss, e.g. 63 -> "1:03".
export function formatTime(time: number): string {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
