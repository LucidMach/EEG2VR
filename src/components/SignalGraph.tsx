import React, { useEffect, useRef } from "react";

interface SignalGraphProps {
  valueHistory: number[];
  color?: string;
  label?: string;
}

const SignalGraph: React.FC<SignalGraphProps> = ({
  valueHistory,
  color = "#3b82f6",
  label = "Signal"
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
    
    // Horizontal center line (0 uV)
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Minor grid lines
    ctx.strokeStyle = "#f3f4f6";
    ctx.beginPath();
    for (let y = height / 6; y < height; y += height / 6) {
      if (Math.abs(y - height / 2) < 2) continue; // skip center
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Draw signal line
    if (valueHistory.length > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const step = width / (valueHistory.length - 1);
      
      // Calculate scaling factor (max amplitude ~40uV)
      const maxAmplitude = 45; 
      
      valueHistory.forEach((val, index) => {
        const x = index * step;
        // Map val (-maxAmplitude to maxAmplitude) to canvas height (height to 0)
        const y = height / 2 - (val / maxAmplitude) * (height / 2);
        
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
      const lastY = height / 2 - (lastVal / maxAmplitude) * (height / 2);
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(lastX - 4, lastY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw labels
    ctx.fillStyle = "#9ca3af";
    ctx.font = "10px sans-serif";
    ctx.fillText("+40 uV", 5, 12);
    ctx.fillText("0 uV", 5, height / 2 - 3);
    ctx.fillText("-40 uV", 5, height - 5);
  }, [valueHistory, color]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-between items-center mb-1 text-xs text-slate-500 font-medium">
        <span>{label} Oscilloscope</span>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
          40 uV Scale
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
