import React, { useState } from "react";
import { Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { triggerXRHaptic } from "../../../utils/xrHaptics";

interface TextLinkProps {
  label: string;
  onClick?: () => void;
  position: [number, number, number];
  fontSize?: number;
  idleColor: string;
  hoverColor: string;
  hitWidth?: number;
  hitHeight?: number;
}

// A secondary, text-only XR action. An invisible padded hit-plane behind
// the label widens the click/hover target beyond the glyph outline, and
// hover/click both trigger the same haptic feel as XRControlPill.
export const TextLink: React.FC<TextLinkProps> = ({
  label,
  onClick,
  position,
  fontSize = 0.012,
  idleColor,
  hoverColor,
  hitWidth = 0.3,
  hitHeight = 0.03,
}) => {
  const [hovered, setHovered] = useState(false);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    triggerXRHaptic(e, 0.25, 10);
  };

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    triggerXRHaptic(e, 0.6, 25);
    onClick?.();
  };

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <planeGeometry args={[hitWidth, hitHeight]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Text
        position={[0, 0, 0.001]}
        fontSize={fontSize}
        color={hovered ? hoverColor : idleColor}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

export default TextLink;
