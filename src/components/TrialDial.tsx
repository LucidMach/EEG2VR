import React, { useRef, useState, useEffect } from "react";
import type { Frame } from "../utils/signalSource";

interface TrialDialProps {
  trialIndex: number;
  totalTrials: number;
  phase: Frame["phase"];
  trialElapsed: number;
  focus?: number;
  focus_avg?: number;
  onTrialSelect: (index: number) => void;
}

const TrialDial: React.FC<TrialDialProps> = ({
  trialIndex,
  phase,
  trialElapsed,
  focus,
  focus_avg,
  onTrialSelect,
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const numTrials = 40; // Always 40 trials on the dial as requested

  // Calculate angle for a given trial index
  // A 240 degree sweep from -120 to +120
  const getAngleForIndex = (index: number) => {
    if (numTrials <= 1) return 0;
    return -120 + index * (240 / (numTrials - 1));
  };

  const activeAngle = getAngleForIndex(trialIndex);
  const currentFocus = focus !== undefined && focus !== null ? focus : null;

  // Drag interaction handlers
  const handleUpdateAngle = (clientX: number, clientY: number) => {
    if (!knobRef.current) return;
    const rect = knobRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = clientX - cx;
    const dy = clientY - cy;

    // Convert mouse angle to degrees. Math.atan2 returns -180 to 180.
    // We add 90 degrees so straight up (dy < 0, dx = 0) is 0 degrees.
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg > 180) deg -= 360;
    if (deg < -180) deg += 360;

    // We want to map this to -120 to 120 range.
    // Clamp to knob limits
    const clampedDeg = Math.min(120, Math.max(-120, deg));

    // Find closest trial index
    let closestIndex = 0;
    let minDiff = Infinity;

    for (let i = 0; i < numTrials; i++) {
      const angle = getAngleForIndex(i);
      const diff = Math.abs(clampedDeg - angle);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    if (closestIndex !== trialIndex) {
      onTrialSelect(closestIndex);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleUpdateAngle(e.clientX, e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleUpdateAngle(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, trialIndex]);

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    handleUpdateAngle(e.touches[0].clientX, e.touches[0].clientY);
  };

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      handleUpdateAngle(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, trialIndex]);

  // Mouse wheel interaction
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    const nextIndex = Math.min(numTrials - 1, Math.max(0, trialIndex + direction));
    if (nextIndex !== trialIndex) {
      onTrialSelect(nextIndex);
    }
  };

  const activeThemeColor = phase === "baseline" ? "text-indigo-400" : "text-emerald-400";
  const activeGlowColor = phase === "baseline"
    ? "shadow-xl border-indigo-500/60"
    : "shadow-xl border-emerald-500/60";

  const isMilestone = (i: number) => i === 0 || i === 9 || i === 19 || i === 29 || i === 39;
  const getMilestoneLabel = (i: number) => {
    if (i === 0) return "01";
    return String(i + 1);
  };

  return (
    <div className="flex flex-col items-center select-none w-[160px] relative">

      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Render Outer Dial Ticks */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          {Array.from({ length: numTrials }).map((_, i) => {
            const angleDeg = getAngleForIndex(i);
            const rad = ((angleDeg - 90) * Math.PI) / 180;

            // Draw fine, high-tech gauge ticks
            const isMil = isMilestone(i);
            const tickLength = isMil ? 16 : 10;
            const rStart = 50 - tickLength;
            const rEnd = 50;

            const x1 = 50 + rStart * Math.cos(rad);
            const y1 = 50 + rStart * Math.sin(rad);
            const x2 = 50 + rEnd * Math.cos(rad);
            const y2 = 50 + rEnd * Math.sin(rad);

            const isTickActive = i === trialIndex;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={`transition-all duration-300 ${isTickActive
                  ? (phase === "baseline" ? "stroke-indigo-500 stroke-[2px]" : "stroke-emerald-500 stroke-[2px]")
                  : (isMil ? "stroke-slate-600 stroke-[1.2px]" : "stroke-slate-800 stroke-[1px]")
                  }`}
              />
            );
          })}
        </svg>

        {/* Rotary Knob Button (Rotates based on active trial angle) */}
        <div
          ref={knobRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onWheel={handleWheel}
          className={`w-30 h-30 rounded-full relative bg-slate-950/95 border-2 flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-300 ${isDragging ? activeGlowColor : "border-slate-800/80 hover:border-slate-700 shadow-xl"
            }`}
          style={{
            transform: `rotate(${activeAngle}deg)`,
            transition: isDragging
              ? "none"
              : "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s, box-shadow 0.3s, scale 0.3s",
          }}
          title="Drag to rotate, scroll, or click labels to switch trials"
        >
          {/* Inside Border indicating current trial phase */}
          <div
            className={`absolute inset-1.5 rounded-full border transition-all duration-300 pointer-events-none ${phase === "baseline"
              ? "border-indigo-400"
              : "border-emerald-400"
              }`}
          />

          {/* Active pointer triangle at the top of the rotating knob */}
          <svg
            className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ${phase === "baseline"
              ? "text-indigo-400 drop-shadow-[0_0_3px_rgba(99,102,241,0.8)]"
              : "text-emerald-400 drop-shadow-[0_0_3px_rgba(16,185,129,0.8)]"
              }`}
            viewBox="0 0 100 100"
            fill="none"
          >
            <polygon
              points="50,0 47.5,6 52.5,6"
              fill="currentColor"
            />
          </svg>

          {/* Embedded Watermark Translucent LucidMach SVG Logo */}
          <svg className="absolute inset-3 w-16 h-16 pointer-events-none opacity-[0.08]" viewBox="0 0 100 100" fill="none">
            {/* Top Face */}
            <polygon
              points="50,5 89,27.5 69.5,38.75 50,27.5 30.5,38.75 11,27.5"
              fill="rgba(243,244,246,0.1)"
              stroke="rgba(243,244,246,0.4)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Left-Bottom Face */}
            <polygon
              points="11,27.5 30.5,38.75 30.5,61.25 50,72.5 50,95 11,72.5"
              fill="rgba(243,244,246,0.1)"
              stroke="rgba(243,244,246,0.4)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Right-Bottom Face */}
            <polygon
              points="89,27.5 69.5,38.75 69.5,61.25 50,72.5 50,95 89,72.5"
              fill="rgba(243,244,246,0.1)"
              stroke="rgba(243,244,246,0.4)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Center Cutout */}
            <polygon
              points="50,27.5 69.5,38.75 69.5,61.25 50,72.5 30.5,61.25 30.5,38.75"
              fill="rgba(15,23,42,0.9)"
              stroke="rgba(243,244,246,0.3)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Central Digital Readout: Focus Metric & Active Trial Readout (Static, does not rotate) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-30">
          <span className={`${phase === "baseline"
            ? "text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]"
            : "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]"
            }`}>
            <span className="text-3xl font-mono font-black tracking-wider transition-all duration-300" >
              {currentFocus !== null ? `${(currentFocus * 100).toFixed(0)}` : "--"}
            </span>
            <span className="text-xs font-bold">%</span>
          </span>
          <span className="text-xs font-black tracking-[0.25em] text-slate-500 uppercase mt-0.5">
            FOCUS
          </span>
          <span className="text-[6px] font-mono font-bold tracking-wider text-slate-400 mt-0.5">
            [AVG: {focus_avg !== undefined && focus_avg !== null ? `${Math.round(focus_avg * 100)}%` : "--"}]
          </span>
        </div>

        {/* Milestone Labels (01, 10, 20, 30, 40) */}
        {Array.from({ length: numTrials }).map((_, i) => {
          if (!isMilestone(i)) return null;

          const angleDeg = getAngleForIndex(i);
          const rad = ((angleDeg - 90) * Math.PI) / 180;

          // Offset text label outside the ticks
          const x = 50 + 60 * Math.cos(rad);
          const y = 50 + 60 * Math.sin(rad);

          const isTextActive = i === trialIndex;

          return (
            <button
              key={i}
              onClick={() => onTrialSelect(i)}
              className={`absolute text-[9px] font-mono font-black -translate-x-1/2 -translate-y-1/2 cursor-pointer z-25 transition-all duration-300 w-6 h-6 flex items-center justify-center rounded-full ${isTextActive
                ? phase === "baseline"
                  ? "text-indigo-400 scale-110"
                  : "text-emerald-400 scale-110"
                : "text-slate-500 hover:text-slate-300"
                }`}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={`Switch to Trial ${i + 1}`}
            >
              {getMilestoneLabel(i)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TrialDial;
