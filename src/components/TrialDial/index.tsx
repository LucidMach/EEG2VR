import React from "react";
import type { Frame } from "../../utils/signalSource";
import { useDialInteraction } from "./useDialInteraction";
import DialTicks from "./DialTicks";
import DialKnob from "./DialKnob";
import DialReadout from "./DialReadout";
import MilestoneLabels from "./MilestoneLabels";

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
  focus,
  focus_avg,
  onTrialSelect,
}) => {
  const { knobRef, isDragging, activeAngle, handleMouseDown, handleTouchStart, handleWheel } =
    useDialInteraction(trialIndex, onTrialSelect);

  return (
    <div className="flex flex-col items-center select-none w-[160px] relative">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <DialTicks trialIndex={trialIndex} phase={phase} />
        <DialKnob
          knobRef={knobRef}
          phase={phase}
          isDragging={isDragging}
          activeAngle={activeAngle}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onWheel={handleWheel}
        />
        <DialReadout phase={phase} focus={focus} focus_avg={focus_avg} />
        <MilestoneLabels trialIndex={trialIndex} phase={phase} onTrialSelect={onTrialSelect} />
      </div>
    </div>
  );
};

export default TrialDial;
