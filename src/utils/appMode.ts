// The app's mode as one discriminated union, replacing the previous pair of
// independent appState/connectionStep variables (which could drift into
// impossible combinations and were re-derived at every JSX branch).
export type AppMode =
  | { kind: "idle" }
  | { kind: "demo" }
  | {
      kind: "live";
      connection: "searching" | "checking" | "connected";
      device?: string;
    };

export interface ModeLayout {
  showLeftSidebar: boolean;
  showRightSidebar: boolean;
  showConnectingLoader: boolean;
  showWebXRControls: boolean;
}

// Single place that decides what the render tree shows for a given mode.
// Pure and testable without mounting anything.
export function layoutFor(mode: AppMode): ModeLayout {
  const isIdle = mode.kind === "idle";
  const isConnecting = mode.kind === "live" && mode.connection !== "connected";

  return {
    showLeftSidebar: !isIdle,
    showRightSidebar: !isIdle && !isConnecting,
    showConnectingLoader: isConnecting,
    showWebXRControls: !isConnecting,
  };
}
