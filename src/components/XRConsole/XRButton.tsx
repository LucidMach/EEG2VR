import React, { useState } from "react";
import { Text } from "@react-three/drei";

interface XRButtonProps {
  position: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

// 3D interactive button for WebXR mode with pointer hover effects
export const XRButton: React.FC<XRButtonProps> = ({
  position,
  width = 0.38,
  height = 0.055,
  depth = 0.015,
  label,
  onClick,
  variant = "primary",
}) => {
  const [hovered, setHovered] = useState(false);

  const bgColor =
    variant === "primary"
      ? hovered
        ? "#334155" // slate-700
        : "#0f172a" // slate-900
      : hovered
      ? "#cbd5e1" // slate-300
      : "#e2e8f0"; // slate-200

  const textColor = variant === "primary" ? "#ffffff" : "#0f172a";

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => {
        setHovered(false);
      }}
    >
      <mesh castShadow receiveShadow position={[0, 0, hovered ? 0.003 : 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={bgColor}
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>
      <Text
        position={[0, 0, depth / 2 + (hovered ? 0.005 : 0.002)]}
        fontSize={height * 0.28}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
      >
        {label}
      </Text>
    </group>
  );
};

export default XRButton;
