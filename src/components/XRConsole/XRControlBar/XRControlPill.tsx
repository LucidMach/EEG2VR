import React, { useState, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { triggerXRHaptic } from "../../../utils/xrHaptics";
import { createPillShape } from "../pillShape";

interface XRControlPillProps {
  label: string;
  onClick?: (e: ThreeEvent<PointerEvent>) => void;
  width?: number;
  height?: number;
  fontSize?: number;
  variant?: "primary" | "secondary" | "active-baseline" | "active-stimulus" | "danger" | "neutral";
  disabled?: boolean;
  position?: [number, number, number];
}

export const XRControlPill: React.FC<XRControlPillProps> = ({
  label,
  onClick,
  width = 0.11,
  height = 0.044,
  fontSize = 0.014,
  variant = "neutral",
  disabled = false,
  position = [0, 0, 0],
}) => {
  const [hovered, setHovered] = useState(false);

  const pillShape = useMemo(
    () => createPillShape(width, height, height / 2),
    [width, height]
  );

  // Smooth outermost contour geometry (no internal triangulation diagonals)
  const outlineGeometry = useMemo(() => {
    const points = pillShape.getPoints(32);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [pillShape]);

  const colors = useMemo(() => {
    if (disabled) {
      return {
        bg: "#0f172a",
        border: "#1e293b",
        text: "#475569",
        glow: "#000000",
      };
    }
    switch (variant) {
      case "active-baseline":
        return {
          bg: hovered ? "#4338ca" : "#4f46e5",
          border: hovered ? "#c7d2fe" : "#818cf8",
          text: "#ffffff",
          glow: "#6366f1",
        };
      case "active-stimulus":
        return {
          bg: hovered ? "#047857" : "#059669",
          border: hovered ? "#a7f3d0" : "#34d399",
          text: "#ffffff",
          glow: "#10b981",
        };
      case "danger":
        return {
          bg: hovered ? "#dc2626" : "#991b1b",
          border: hovered ? "#fecaca" : "#f87171",
          text: "#fee2e2",
          glow: "#ef4444",
        };
      case "primary":
        return {
          bg: hovered ? "#334155" : "#1e293b",
          border: hovered ? "#cbd5e1" : "#64748b",
          text: "#ffffff",
          glow: "#64748b",
        };
      case "secondary":
      case "neutral":
      default:
        return {
          bg: hovered ? "#1e293b" : "#0f172a",
          border: hovered ? "#38bdf8" : "#334155",
          text: hovered ? "#38bdf8" : "#e2e8f0",
          glow: hovered ? "#0284c7" : "#000000",
        };
    }
  }, [variant, hovered, disabled]);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
    e.stopPropagation();
    setHovered(true);
    triggerXRHaptic(e, 0.25, 10);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
    e.stopPropagation();
    setHovered(false);
  };

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
    e.stopPropagation();
    triggerXRHaptic(e, 0.6, 25);
    onClick?.(e);
  };

  const zElev = hovered && !disabled ? 0.005 : 0;

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 1. Button Base */}
      <mesh position={[0, 0, zElev]}>
        <shapeGeometry args={[pillShape]} />
        <meshStandardMaterial
          color={colors.bg}
          roughness={0.2}
          metalness={0.2}
          emissive={colors.glow}
          emissiveIntensity={hovered ? 0.35 : 0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Outermost Wireframe Outline (highlights ONLY the outer boundary perimeter) */}
      <lineLoop geometry={outlineGeometry} position={[0, 0, zElev + 0.002]}>
        <lineBasicMaterial
          color={colors.border}
          transparent
          opacity={hovered ? 1.0 : 0.4}
        />
      </lineLoop>

      {/* 3. Button Label */}
      <Text
        position={[0, 0, zElev + 0.004]}
        fontSize={fontSize}
        color={colors.text}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
};

export default XRControlPill;
