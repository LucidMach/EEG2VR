import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ElectrodeName, Frame } from "../../../utils/signalSource";
import type { HistorySample } from "../../../hooks/usePlaybackEngine";
import { renderDashboard, CANVAS_WIDTH, CANVAS_HEIGHT } from "./renderDashboard";
import type { InteractiveHitArea } from "./types";

interface UseXRDashboardTextureParams {
  frameRef: React.RefObject<Frame>;
  historiesRef?: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  selectedChannel: ElectrodeName | null;
  speed: number;
  isPaused: boolean;
}

export function useXRDashboardTexture({
  frameRef,
  historiesRef,
  selectedChannel,
  speed,
  isPaused,
}: UseXRDashboardTextureParams) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const hitAreasRef = useRef<InteractiveHitArea[]>([]);
  const lastDrawTimeRef = useRef<number>(0);

  if (!canvasRef.current && typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvasRef.current = canvas;

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = texture;
  }

  useEffect(() => {
    return () => {
      textureRef.current?.dispose();
    };
  }, []);

  useFrame((threeState) => {
    const isPresenting = threeState.gl.xr.isPresenting;
    if (!isPresenting && process.env.NODE_ENV !== "development") return;

    const canvas = canvasRef.current;
    const texture = textureRef.current;
    if (!canvas || !texture) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    // Render at up to 30 FPS inside VR to conserve GPU/CPU cycles
    if (now - lastDrawTimeRef.current < 33) return;
    lastDrawTimeRef.current = now;

    const frame = frameRef.current;
    const histories = historiesRef?.current ?? ({} as Record<ElectrodeName, HistorySample[]>);

    const hitAreas = renderDashboard(ctx, {
      frame,
      histories,
      selectedChannel,
      speed,
      isPaused,
    });

    hitAreasRef.current = hitAreas;
    texture.needsUpdate = true;
  });

  return { texture: textureRef.current, hitAreasRef };
}
