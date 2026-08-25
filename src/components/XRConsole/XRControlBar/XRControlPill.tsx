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
  variant?: "primary" | "secondary" | "active" | "danger" | "neutral";
  disabled?: boolean;
  position?: [number, number, number];
}

export const XRControlPill: React.FC<XRControlPillProps> = ({
  label,
  onClick,
  width = 0.12,
  height = 0.044,
  fontSize = 0.015,
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
        bg: "#1e293b",
        border: "#334155",
        text: "#64748b",
        emissive: "#000000",
      };
    }
    switch (variant) {
      case "active":
        return {
          bg: "#0284c7",
          border: "#38bdf8",
          text: "#ffffff",
          emissive: "#0284c7",
        };
      case "primary":
        return {
          bg: hovered ? "#2563eb" : "#1d4ed8",
          border: hovered ? "#60a5fa" : "#3b82f6",
          text: "#ffffff",
          emissive: hovered ? "#1d4ed8" : "#000000",
        };
      case "danger":
        return {
          bg: hovered ? "#dc2626" : "#991b1b",
          border: hovered ? "#f87171" : "#ef4444",
          text: "#fee2e2",
          emissive: hovered ? "#dc2626" : "#000000",
        };
      case "secondary":
        return {
          bg: hovered ? "#334155" : "#1e293b",
          border: hovered ? "#94a3b8" : "#475569",
          text: "#f8fafc",
          emissive: hovered ? "#334155" : "#000000",
        };
      case "neutral":
      default:
        return {
          bg: hovered ? "#1e293b" : "#0f172a",
          border: hovered ? "#38bdf8" : "#334155",
          text: hovered ? "#38bdf8" : "#e2e8f0",
          emissive: hovered ? "#0284c7" : "#000000",
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
    triggerXRHaptic(e, 0.6, 25);
    onClick?.(e);
  };

  const zElev = hovered && !disabled ? 0.006 : 0;

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 3D Button Pill Mesh */}
      <mesh position={[0, 0, zElev]}>
        <shapeGeometry args={[pillShape]} />
        <meshStandardMaterial
          color={colors.bg}
          roughness={0.2}
          metalness={0.2}
          emissive={colors.emissive}
          emissiveIntensity={hovered ? 0.4 : 0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Button Label */}
      <Text
        position={[0, 0, zElev + 0.005]}
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
