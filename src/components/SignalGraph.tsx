import React, { useEffect, useRef } from "react";

interface SignalGraphProps {
  valueHistory: number[];
  color?: string;
  label?: string;
  isNormalized?: boolean;
}

const SignalGraph: React.FC<SignalGraphProps> = ({
  valueHistory,
  color = "#3b82f6",
  label = "Signal",
  isNormalized = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    
    if (!isNormalized) {
      // Horizontal center line (0 uV) for raw signals only
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    }

    // Minor grid lines
    ctx.strokeStyle = "#f3f4f6";
    ctx.beginPath();
    if (isNormalized) {
      // For normalized [0, 1] range, draw grid at 0.25, 0.5, 0.75 heights
      for (let y = height / 4; y < height; y += height / 4) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
    } else {
      for (let y = height / 6; y < height; y += height / 6) {
        if (Math.abs(y - height / 2) < 2) continue; // skip center
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
    }
    ctx.stroke();

    // Draw signal line
    if (valueHistory.length > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const step = width / (valueHistory.length - 1);
      const maxAmplitude = isNormalized ? 1.0 : 45; 
      
      valueHistory.forEach((val, index) => {
        const x = index * step;
        let y;
        if (isNormalized) {
          // Map val (0 to 1) to canvas height (height to 0)
          y = height - val * height;
        } else {
          // Map val (-maxAmplitude to maxAmplitude) to canvas height (height to 0)
          y = height / 2 - (val / maxAmplitude) * (height / 2);
        }
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw active value dot
      const lastVal = valueHistory[valueHistory.length - 1];
      const lastX = width;
      const lastY = isNormalized
        ? height - lastVal * height
        : height / 2 - (lastVal / maxAmplitude) * (height / 2);
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(lastX - 4, lastY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw labels
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px sans-serif";
    if (isNormalized) {
      ctx.fillText("1.0 (Max)", 5, 12);
      ctx.fillText("0.5", 5, height / 2 - 3);
      ctx.fillText("0.0 (Min)", 5, height - 5);
    } else {
      ctx.fillText("+40 uV", 5, 12);
      ctx.fillText("0 uV", 5, height / 2 - 3);
      ctx.fillText("-40 uV", 5, height - 5);
    }
  }, [valueHistory, color, isNormalized]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-between items-center mb-1 text-xs text-slate-500 font-medium">
        <span>{label} Oscilloscope</span>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
          {isNormalized ? "Normalized [0, 1] Scale" : "40 uV Scale"}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-slate-200 rounded-lg shadow-inner"
        style={{ display: "block" }}
      />
    </div>
  );
};

export default SignalGraph;
