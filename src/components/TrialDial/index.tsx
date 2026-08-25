import React from "react";
import type { Frame } from "../../utils/signalSource";
import DialKnob from "./DialKnob";
import DialReadout from "./DialReadout";

interface TrialDialProps {
  phase: Frame["phase"];
  focus?: number;
  focus_avg?: number;
  trialIndex?: number;
  totalTrials?: number;
  trialElapsed?: number;
  onTrialSelect?: (index: number) => void;
}

// Focus Metrics Gauge: clean focus readout and running average
const TrialDial: React.FC<TrialDialProps> = ({
  phase,
  focus,
  focus_avg,
}) => {
  return (
    <div className="flex flex-col items-center select-none w-32 relative pointer-events-none">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <DialKnob phase={phase} />
        <DialReadout phase={phase} focus={focus} focus_avg={focus_avg} />
      </div>
    </div>
  );
};

export default TrialDial;
