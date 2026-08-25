import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ElectrodeName, Frame } from "../../../utils/signalSource";
import type { HistorySample } from "../../../hooks/usePlaybackEngine";
import {
  renderCylinderWall,
  CYLINDER_CANVAS_WIDTH,
  CYLINDER_CANVAS_HEIGHT,
} from "./renderCylinderWall";
import type { CylinderChannelHitArea } from "./types";

interface UseXRCylinderTextureProps {
  frameRef: React.RefObject<Frame>;
  historiesRef?: React.RefObject<Record<ElectrodeName, HistorySample[]>>;
  selectedChannel: ElectrodeName | null;
  hoveredChannelRef: React.RefObject<ElectrodeName | null>;
  hitAreasRef: React.RefObject<CylinderChannelHitArea[]>;
}

export function useXRCylinderTexture({
  frameRef,
  historiesRef,
  selectedChannel,
  hoveredChannelRef,
  hitAreasRef,
}: UseXRCylinderTextureProps) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawTimeRef = useRef<number>(0);
  const lastFrameRef = useRef<Frame | null>(null);
  const prevSelectedChannelRef = useRef<ElectrodeName | null>(null);
  const prevHoveredChannelRef = useRef<ElectrodeName | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CYLINDER_CANVAS_WIDTH;
    canvas.height = CYLINDER_CANVAS_HEIGHT;
    canvasRef.current = canvas;

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.anisotropy = 8;
    // Un-mirror horizontally for viewing inside of cylinder
    tex.wrapS = THREE.RepeatWrapping;
    tex.repeat.x = -1;
    tex.offset.x = 1;

    setTexture(tex);

    return () => {
      tex.dispose();
      canvasRef.current = null;
    };
  }, []);

  // Update on each animation frame inside R3F / WebXR render loop
  useFrame(() => {
    const canvas = canvasRef.current;
    const currentFrame = frameRef.current;
    const hoveredChannel = hoveredChannelRef.current;
    const now = performance.now();

    if (canvas && texture && currentFrame) {
      const elapsed = now - lastDrawTimeRef.current;
      const channelChanged =
        selectedChannel !== prevSelectedChannelRef.current ||
        hoveredChannel !== prevHoveredChannelRef.current;
      const frameChanged = currentFrame !== lastFrameRef.current;

      // Throttle to 30 FPS or repaint immediately on channel selection / hover change
      if (channelChanged || (frameChanged && elapsed >= 33)) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const hitAreas = renderCylinderWall(ctx, {
            frame: currentFrame,
            histories: historiesRef?.current || ({} as Record<ElectrodeName, HistorySample[]>),
            selectedChannel,
            hoveredChannel,
          });

          if (hitAreasRef.current) {
            (hitAreasRef.current as any) = hitAreas;
          }
          texture.needsUpdate = true;
          lastDrawTimeRef.current = now;
          lastFrameRef.current = currentFrame;
          prevSelectedChannelRef.current = selectedChannel;
          prevHoveredChannelRef.current = hoveredChannel;
        }
      }
    }
  });

  return { texture };
}
