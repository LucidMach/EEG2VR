import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
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
    setTexture(tex);

    return () => {
      tex.dispose();
      canvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    let animFrameId = 0;

    const loop = (time: number) => {
      const canvas = canvasRef.current;
      const currentFrame = frameRef.current;
      const hoveredChannel = hoveredChannelRef.current;

      if (canvas && texture && currentFrame) {
        // Throttle updates to ~30 FPS to conserve GPU bandwidth
        const elapsed = time - lastDrawTimeRef.current;
        const channelChanged =
          selectedChannel !== prevSelectedChannelRef.current ||
          hoveredChannel !== prevHoveredChannelRef.current;
        const frameChanged = currentFrame !== lastFrameRef.current;

        if (channelChanged || (frameChanged && elapsed >= 33)) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const hitAreas = renderCylinderWall(ctx, {
              frame: currentFrame,
              histories: historiesRef?.current || ({} as Record<ElectrodeName, HistorySample[]>),
              selectedChannel,
              hoveredChannel,
            });

            hitAreasRef.current = hitAreas;
            texture.needsUpdate = true;
            lastDrawTimeRef.current = time;
            lastFrameRef.current = currentFrame;
            prevSelectedChannelRef.current = selectedChannel;
            prevHoveredChannelRef.current = hoveredChannel;
          }
        }
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [texture, frameRef, historiesRef, selectedChannel, hoveredChannelRef, hitAreasRef]);

  return { texture };
}
