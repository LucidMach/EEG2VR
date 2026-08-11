import React from "react";
import type { Frame } from "../../utils/signalSource";
import TrialProgressBar from "../TrialProgressBar";
import TrialDial from "../TrialDial";

interface DemoBottomControlsProps {
  frame: Frame;
  onTrialSelect: (index: number, startOffset?: number) => void;
}

// Floating bottom-of-screen Demo Mode controls: the trial timeline (left,
// stretching across) and the rotary trial dial (bottom-right).
const DemoBottomControls: React.FC<DemoBottomControlsProps> = ({ frame, onTrialSelect }) => (
  <>
    <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center z-30 pl-8 pr-56 md:px-8 pointer-events-none">
      <div className="w-full max-w-3xl pointer-events-auto">
        <TrialProgressBar
          trialElapsed={frame.trialElapsed ?? 0}
          phase={frame.phase}
          trialIndex={frame.trialIndex ?? 0}
          onTrialSelect={onTrialSelect}
        />
      </div>
    </div>

    <div className="absolute right-6 bottom-6 z-30 pointer-events-auto">
      <TrialDial
        trialIndex={frame.trialIndex ?? 0}
        totalTrials={40}
        phase={frame.phase}
        trialElapsed={frame.trialElapsed ?? 0}
        focus={frame.focus}
        focus_avg={frame.focus_avg}
        onTrialSelect={onTrialSelect}
      />
    </div>
  </>
);

export default DemoBottomControls;
