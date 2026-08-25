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

  const colors = useMemo(() => {
    if (disabled) {
      return {
        bg: "#0f172a",
        border: "#1e293b",
        text: "#475569",
      };
    }
    switch (variant) {
      case "active-baseline":
        return {
          bg: "#4f46e5",
          border: "#6366f1",
          text: "#ffffff",
        };
      case "active-stimulus":
        return {
          bg: "#059669",
          border: "#10b981",
          text: "#ffffff",
        };
      case "danger":
        return {
          bg: hovered ? "#dc2626" : "#991b1b",
          border: hovered ? "#f87171" : "#ef4444",
          text: "#fee2e2",
        };
      case "primary":
        return {
          bg: hovered ? "#334155" : "#1e293b",
          border: hovered ? "#64748b" : "#334155",
          text: "#ffffff",
        };
      case "secondary":
      case "neutral":
      default:
        return {
          bg: hovered ? "#1e293b" : "#0f172a",
          border: hovered ? "#475569" : "#1e293b",
          text: hovered ? "#ffffff" : "#94a3b8",
        };
    }
  }, [variant, hovered, disabled]);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
    e.stopPropagation();
    setHovered(true);
    triggerXRHaptic(e, 0.2, 10);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
    e.stopPropagation();
    setHovered(false);
  };

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
    e.stopPropagation();
    triggerXRHaptic(e, 0.5, 25);
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
      <mesh position={[0, 0, zElev]}>
        <shapeGeometry args={[pillShape]} />
        <meshStandardMaterial
          color={colors.bg}
          roughness={0.2}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

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
