import React from "react";

// Embedded translucent LucidMach cube watermark shown inside the knob face.
const WatermarkLogo: React.FC = () => (
  <svg className="absolute inset-3 w-16 h-16 pointer-events-none opacity-[0.08]" viewBox="0 0 100 100" fill="none">
    <polygon
      points="50,5 89,27.5 69.5,38.75 50,27.5 30.5,38.75 11,27.5"
      fill="rgba(243,244,246,0.1)"
      stroke="rgba(243,244,246,0.4)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <polygon
      points="11,27.5 30.5,38.75 30.5,61.25 50,72.5 50,95 11,72.5"
      fill="rgba(243,244,246,0.1)"
      stroke="rgba(243,244,246,0.4)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <polygon
      points="89,27.5 69.5,38.75 69.5,61.25 50,72.5 50,95 89,72.5"
      fill="rgba(243,244,246,0.1)"
      stroke="rgba(243,244,246,0.4)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <polygon
      points="50,27.5 69.5,38.75 69.5,61.25 50,72.5 30.5,61.25 30.5,38.75"
      fill="rgba(15,23,42,0.9)"
      stroke="rgba(243,244,246,0.3)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export default WatermarkLogo;
