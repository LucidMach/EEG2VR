import * as THREE from "three";
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { createXRStore, XR } from "@react-three/xr";
import EEGHead from "./eegHead";
import SignalGraph from "./SignalGraph";
import { getElectrodeMetadata, type ElectrodeName, type Frame, type SignalSource } from "../utils/signalSource";
import { idleSignalSource, qualityCheckSignalSource } from "../utils/proceduralSignalSource";
import { createDeapSignalSource } from "../utils/deapSignalSource";

// Initialize WebXR store outside the component
const xrStore = createXRStore({
  depthSensing: false
});

const INITIAL_FRAME: Frame = idleSignalSource.getFrame(0);

// SpannedText component to span text letters across parent container width
interface SpannedTextProps {
  text: string;
  className?: string;
}

const SpannedText: React.FC<SpannedTextProps> = ({ text, className = "" }) => {
  return (
    <div className={`flex justify-between w-full font-offbit uppercase tracking-normal select-none ${className}`}>
      {text.split("").map((char, index) => (
        <span key={index}>{char === " " ? " " : char}</span>
      ))}
    </div>
  );
};

// Component to dynamically adapt model for 2D vs. VR presentation
interface HeadWrapperProps {
  frame: Frame;
  selectedChannel: ElectrodeName | null;
  onChannelSelect: (name: ElectrodeName) => void;
}

const HeadWrapper: React.FC<HeadWrapperProps> = ({
  frame,
  selectedChannel,
  onChannelSelect,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const isIdleShowcase = frame.phase === "idle";

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const isPresenting = state.gl.xr.isPresenting;

    if (groupRef.current) {
      if (isPresenting) {
        // --- WebXR VR/AR Presentation Layout ---
        // Position at eye level, roughly 1.1 meters in front of the camera
        groupRef.current.position.set(0, 1.3, -1.1);

        // Map the user's XR headset's rotation to the digital twin headset rotation!
        groupRef.current.quaternion.copy(state.camera.quaternion);

        // Scale to a realistic physical head size (approx 22cm diameter)
        groupRef.current.scale.setScalar(0.012);
      } else {
        // --- Standard 2D Desktop Layout ---
        // Dynamically scale model to occupy exactly 1/3 of the viewport height
        // Model height is approx 22 units in Blender local space.
        const targetScale = state.viewport.height / 66;

        if (isIdleShowcase) {
          // Slow showcase spin in idle mode
          groupRef.current.rotation.y = time * 0.15;
          groupRef.current.rotation.x = Math.sin(time * 0.4) * 0.05 + Math.PI / 32;

          // Subtle bobbing motion
          groupRef.current.position.set(0, -11 * targetScale - Math.cos(time * 1.2) * 0.2, 0);
          groupRef.current.scale.setScalar(targetScale * 1.1);
        } else {
          groupRef.current.scale.setScalar(targetScale);
          groupRef.current.position.set(0, -11 * targetScale, 0);
          groupRef.current.rotation.y = 0;
          groupRef.current.rotation.x = Math.PI / 32;
        }
      }
    }
  });

  const getSelectedChannelValue = () => {
    if (selectedChannel && frame.channels[selectedChannel]) {
      return frame.channels[selectedChannel]!.value;
    }
    return 0;
  };

  return (
    <group>
      <EEGHead
        ref={groupRef}
        frame={frame}
        selectedChannel={selectedChannel}
        onChannelSelect={onChannelSelect}
        rotation={[Math.PI / 32, 0, 0]}
      />
      {/* Render 3D Floating Console in WebXR Mode only */}
      <XRConsoleWrapper
        frame={frame}
        selectedChannel={selectedChannel}
        currentValue={getSelectedChannelValue()}
      />
    </group>
  );
};

// Check if presenting in VR to show the floating 3D control board
const XRConsoleWrapper: React.FC<{
  frame: Frame;
  selectedChannel: ElectrodeName | null;
  currentValue: number;
}> = ({ frame, selectedChannel, currentValue }) => {
  const [inVR, setInVR] = useState(false);

  useFrame((state) => {
    setInVR(state.gl.xr.isPresenting);
  });

  if (!inVR || frame.phase === "idle") return null;

  const contextLabel =
    frame.phase === "quality-check"
      ? "Monitoring Signal Quality"
      : `Trial ${(frame.trialIndex ?? 0) + 1} · ${frame.phase === "baseline" ? "Baseline" : "Stimulus"}`;

  return (
    <group position={[0.55, 1.1, -0.9]} rotation={[0, -Math.PI / 6, 0]}>
      {/* Console Plate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.42, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.1} />
      </mesh>

      {/* Title */}
      <Text
        position={[0, 0.16, 0.015]}
        fontSize={0.022}
        color="#0f172a"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
      >
        EEG DIGITAL TWIN
      </Text>

      {/* Context readout: current trial/phase, or connection-quality status */}
      <Text
        position={[0, 0.1, 0.015]}
        fontSize={0.014}
        color="#4f46e5"
        anchorX="center"
        anchorY="middle"
      >
        {contextLabel}
      </Text>

      {frame.phase === "stimulus" && frame.ratings && (
        <Text
          position={[0, 0.06, 0.015]}
          fontSize={0.011}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {`Valence ${frame.ratings.valence.toFixed(1)}  Arousal ${frame.ratings.arousal.toFixed(1)}`}
        </Text>
      )}

      {/* Sensor Monitor Box */}
      <group position={[0, -0.05, 0.015]}>
        <mesh>
          <boxGeometry args={[0.42, 0.07, 0.012]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} />
        </mesh>
        <Text
          position={[0, 0.01, 0.007]}
          fontSize={0.014}
          color="#475569"
          anchorX="center"
          anchorY="middle"
        >
          {selectedChannel
            ? `Electrode: ${selectedChannel}`
            : "Point/Click LED to Inspect"}
        </Text>
        <Text
          position={[0, -0.012, 0.007]}
          fontSize={0.012}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {selectedChannel
            ? `Value: ${currentValue.toFixed(2)} uV`
            : "No Channel Selected"}
        </Text>
      </group>
    </group>
  );
};

interface TrialProgressBarProps {
  trialElapsed: number; // 0 to 63
  phase: Frame["phase"];
  trialIndex: number;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  onTrialSelect: (index: number, startOffset?: number) => void;
}

const TrialProgressBar: React.FC<TrialProgressBarProps> = ({
  trialElapsed,
  phase,
  trialIndex,
  playbackSpeed,
  onSpeedChange,
  onTrialSelect,
}) => {
  const totalDuration = 63;
  const baselineDuration = 3;

  // Format time display as m:ss
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-2 w-full text-slate-800">
      {/* 40 Connected Trials: Circle (Baseline) -> Bar (Stimulation) */}
      <div className="flex justify-between items-center w-full gap-0 select-none">
        {Array.from({ length: 40 }).map((_, i) => {
          const isPast = i < trialIndex;
          const isActive = i === trialIndex;
          
          // Progress of stimulus within active trial
          const stimulusProgress = isActive ? Math.max(0, trialElapsed - baselineDuration) : 0;
          const stimulusPercentage = (stimulusProgress / 60) * 100;

          return (
            <React.Fragment key={i}>
              {/* Baseline Circle (3 seconds) */}
              <button
                onClick={() => onTrialSelect(i, 0)}
                className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300 relative cursor-pointer ${
                  isActive && phase === "baseline"
                    ? "border-2 border-indigo-600 bg-white scale-125 shadow-sm"
                    : isPast || (isActive && phase === "stimulus")
                    ? "bg-indigo-600 border border-indigo-500 shadow-sm"
                    : "bg-slate-200 border border-slate-300"
                }`}
                title={`Trial ${i + 1} - Baseline (3s)`}
              >
                {isActive && phase === "baseline" && (
                  <span className="absolute inset-[-4px] rounded-full bg-indigo-500/30 animate-pulse" />
                )}
              </button>

              {/* Connecting Bar / Stimulation (60 seconds) */}
              <button
                onClick={() => onTrialSelect(i, 3)}
                className="flex-grow h-[3px] relative bg-slate-200 hover:bg-slate-300 cursor-pointer min-w-[6px] mx-[1px]"
                title={`Trial ${i + 1} - Stimulation (60s)`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-100 ease-out ${
                    isPast ? "bg-emerald-500 w-full" : isActive && phase === "emerald-500" || isActive && phase === "stimulus" ? "bg-emerald-500" : "w-0"
                  }`}
                  style={{ width: isActive && phase === "stimulus" ? `${stimulusPercentage}%` : undefined }}
                />
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Sub-label showing current trial details, speed controller, and time readout */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold select-none mt-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-800 font-bold">
            Trial {(trialIndex ?? 0) + 1} of 40
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide transition-all duration-300 ${
              phase === "baseline"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {phase === "baseline" ? "Baseline Phase" : "Stimulation Phase"}
          </span>
        </div>

        {/* Speed Selector and Timer */}
        <div className="flex items-center gap-3">
          {/* Speed Selector Pill buttons */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {[1, 2, 5, 10].map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-2 py-0.5 rounded-[5px] text-[9px] font-bold transition-all duration-150 cursor-pointer ${
                  playbackSpeed === speed
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <div className="font-mono text-slate-700">
            {formatTime(trialElapsed)} / {formatTime(totalDuration)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Color the oscilloscope trace by what the current frame represents.
function graphColorForPhase(phase: Frame["phase"]): string {
  switch (phase) {
    case "baseline": return "#64748b";
    case "stimulus": return "#10b981";
    case "quality-check": return "#ef4444";
    default: return "#10b981";
  }
}

const R3F: React.FC = () => {
  // App Modes: 'idle' | 'demo' | 'live'
  const [appState, setAppState] = useState<'idle' | 'demo' | 'live'>('idle');

  // Channel Telemetry
  const [selectedChannel, setSelectedChannel] = useState<ElectrodeName | null>("Cz");
  const [hoveredChannel, setHoveredChannel] = useState<ElectrodeName | null>(null);
  const [currentFrame, setCurrentFrame] = useState<Frame>(INITIAL_FRAME);
  const [valueHistory, setValueHistory] = useState<number[]>([]);
  const historyLimit = 120;

  // Playback speed multiplier (1x, 2x, 5x, 10x)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Elapsed playback clock for whichever SignalSource is currently active
  const timeRef = useRef<number>(0);
  const signalSourceRef = useRef<SignalSource>(idleSignalSource);

  // Live Mode Mocking States
  const [connectionStep, setConnectionStep] = useState<number>(0); // 0=searching, 1=checking, 2=connected
  const [connectedDevice, setConnectedDevice] = useState<string>("");

  // Swap the active SignalSource whenever app/connection state changes.
  // Demo Mode gets a fresh DEAP playback adapter each time it starts, so
  // playback always restarts from trial 0 / baseline.
  useEffect(() => {
    timeRef.current = 0;
    setPlaybackSpeed(1); // Reset speed to 1x on mode switch

    if (appState === 'idle') {
      signalSourceRef.current = idleSignalSource;
    } else if (appState === 'demo') {
      signalSourceRef.current = createDeapSignalSource();
    } else if (appState === 'live' && connectionStep === 2) {
      signalSourceRef.current = qualityCheckSignalSource;
    }
  }, [appState, connectionStep]);

  // Single persistent data loop: ask whichever SignalSource is active for
  // the frame at the current elapsed time. Same call site regardless of
  // whether that's the procedural generator or the DEAP-playback adapter.
  useEffect(() => {
    const timer = setInterval(() => {
      timeRef.current += 0.05 * playbackSpeed;
      const frame = signalSourceRef.current.getFrame(timeRef.current);
      setCurrentFrame(frame);

      if (frame.phase !== 'idle' && selectedChannel) {
        const val = frame.channels[selectedChannel]?.value ?? 0;
        setValueHistory((prev) => {
          const next = [...prev, val];
          if (next.length > historyLimit) {
            next.shift();
          }
          return next;
        });
      }
    }, 50);

    return () => clearInterval(timer);
  }, [selectedChannel, playbackSpeed]);

  // Clean value history when switching channel or restarting a mode
  useEffect(() => {
    setValueHistory([]);
  }, [selectedChannel, appState]);

  // Handle trial selection (timeline navigation) with start offset seek
  const handleTrialSelect = (index: number, startOffset = 0) => {
    timeRef.current = index * 63 + startOffset;
    setValueHistory([]);
    const frame = signalSourceRef.current.getFrame(timeRef.current);
    setCurrentFrame(frame);
  };

  // Start Demo Mode
  const startDemoMode = () => {
    setAppState('demo');
    setSelectedChannel("Cz");
  };

  // Start Live Mode
  const startLiveMode = () => {
    setAppState('live');
    setConnectionStep(0);

    // Simulate connection flow
    setTimeout(() => {
      setConnectionStep(1); // Impedance check
      setTimeout(() => {
        setConnectionStep(2); // Successfully connected
        setConnectedDevice("Cyton 8-Ch Bluetooth Headset");
        setSelectedChannel("Cz");
      }, 2500);
    }, 2000);
  };

  const disconnectHeadset = () => {
    setAppState('idle');
    setSelectedChannel("Cz");
    setConnectedDevice("");
  };

  const activeMetadata = selectedChannel ? getElectrodeMetadata(selectedChannel) : null;

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative bg-white overflow-hidden text-slate-800 font-sans">

      {/* ======================================================== */}
      {/* 2D LAYOUT: LEFT SIDEBAR (Controls & Status)              */}
      {/* ======================================================== */}
      {appState !== 'idle' && (
        <div className="w-full md:w-80 bg-white/95 border-b md:border-b-0 md:border-r border-slate-200 z-10 p-5 flex flex-col justify-between overflow-y-auto backdrop-blur-md">
          <div>
            {/* Header / App State indicator */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm uppercase tracking-wider font-semibold text-slate-400">System State</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${appState === 'live' ? 'bg-emerald-500 animate-ping' : 'bg-blue-500'}`}></span>
                  <span className="font-bold text-slate-700 text-base capitalize">
                    {appState === 'live' ? 'Live Telemetry' : 'Demo Stream'}
                  </span>
                </div>
                {connectedDevice && (
                  <span className="text-[10px] text-slate-400 block mt-0.5">{connectedDevice}</span>
                )}
              </div>
              <button
                onClick={disconnectHeadset}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 transition-all font-medium"
              >
                Disconnect
              </button>
            </div>

            {/* Connection Check loader for Live Mode */}
            {appState === 'live' && connectionStep < 2 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex flex-col items-center justify-center py-8">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-3"></div>
                <p className="text-sm font-semibold text-slate-700">
                  {connectionStep === 0 ? "Searching for headset..." : "Conducting impedance checks..."}
                </p>
                <p className="text-xs text-slate-400 mt-1">Make sure Bluetooth is enabled</p>
              </div>
            )}

            {/* Demo Mode: DEAP trial playback readout (participant 7) */}
            {appState === 'demo' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">DEAP Trial Playback</h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">
                      Trial {(currentFrame.trialIndex ?? 0) + 1}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${currentFrame.phase === 'baseline' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                      {currentFrame.phase === 'baseline' ? 'Baseline' : 'Stimulus'}
                    </span>
                  </div>
                  {currentFrame.stimulusId && (
                    <span className="text-[11px] text-slate-400 font-mono block">{currentFrame.stimulusId}</span>
                  )}
                  {currentFrame.phase === 'stimulus' && currentFrame.ratings && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      {Object.entries(currentFrame.ratings).map(([label, val]) => (
                        <div key={label} className="flex justify-between text-[11px] font-medium text-slate-500 capitalize">
                          <span>{label}</span>
                          <span className="font-mono text-slate-700">{val.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Participant 7's recorded session plays back automatically, trial to trial, including each 3s pre-stimulus baseline.
                </p>
              </div>
            )}

            {/* Live Mode: connection-quality status (no manual mode selection) */}
            {appState === 'live' && connectionStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signal Quality Check</h3>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold block text-red-700">Monitoring Connection Quality</span>
                    <span className="text-[10px] text-red-400">Impedance telemetry (kOhm)</span>
                  </div>
                  <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full font-mono text-red-700">21 Ch</span>
                </div>
              </div>
            )}
          </div>

          {/* WebXR Entry Controls inside Sidebar */}
          {!(appState === 'live' && connectionStep < 2) && (
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">WebXR Experience</h3>
              <button
                onClick={() => xrStore.enterVR()}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all hover:scale-[1.01]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-4.5 7.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM9.5 13.5C8.67 13.5 8 12.83 8 12s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
                Enter VR Headset
              </button>
              <button
                onClick={() => xrStore.enterAR()}
                className="w-full flex items-center justify-center gap-2 border border-indigo-600 hover:bg-indigo-50 text-indigo-600 text-sm font-bold py-2.5 px-4 rounded-xl transition-all"
              >
                Launch Mobile AR
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3D VIEWPORT: CENTER SECTION                             */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col relative bg-white">

        {/* Hover / Tooltip HUD overlay */}
        {appState !== 'idle' && hoveredChannel && (
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 text-white rounded-lg p-3 shadow-lg pointer-events-none text-xs flex flex-col gap-1 border border-slate-700">
            <span className="font-bold text-sm text-indigo-400">{hoveredChannel} Electrode</span>
            <span>Value: {(currentFrame.channels[hoveredChannel]?.value ?? 0).toFixed(2)} µV</span>
            {currentFrame.channels[hoveredChannel]?.impedance !== undefined && (
              <span>Impedance: {currentFrame.channels[hoveredChannel]!.impedance!.toFixed(1)} kΩ</span>
            )}
            {currentFrame.channels[hoveredChannel]?.quality && (
              <span className="capitalize">Quality: {currentFrame.channels[hoveredChannel]?.quality}</span>
            )}
          </div>
        )}

        {/* Layer 1: Solid Text Behind the Headset */}
        {appState === 'idle' && (
          <div className="absolute top-12 md:top-16 left-0 right-0 z-0 pointer-events-none select-none px-6 md:px-12 lg:px-16">
            <div className="flex flex-col items-stretch w-full">
              <SpannedText text="an MNET experience" className="text-slate-900 text-sm sm:text-base md:text-lg lg:text-xl font-bold" />
              <h1 className="flex justify-between w-full text-[13vw] font-black uppercase leading-none text-slate-900">
                {"BrainXR".split("").map((char, index) => (
                  <span key={index}>{char}</span>
                ))}
              </h1>
            </div>
          </div>
        )}

        {/* 3D R3F Canvas */}
        <div className="w-full h-full z-10">
          <Canvas
            shadows
            camera={{ position: [0, 0, 7.5], fov: 45 }}
            style={{ background: appState === 'idle' ? "transparent" : "white" }}
            gl={{ alpha: true }}
          >
            {/* White solid environment background when not idle */}
            {appState !== 'idle' && <color attach="background" args={["#ffffff"]} />}

            <ambientLight intensity={Math.PI / 1.5} />
            <directionalLight
              position={[5, 10, 5]}
              intensity={Math.PI}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-10, 10, -5]} intensity={Math.PI / 2} />
            <pointLight position={[0, -10, 0]} intensity={Math.PI / 2} />

            <XR store={xrStore}>
              <HeadWrapper
                frame={currentFrame}
                selectedChannel={selectedChannel}
                onChannelSelect={setSelectedChannel}
              />
            </XR>

            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              minDistance={3}
              maxDistance={20}
              makeDefault
            />
          </Canvas>
        </div>

        {/* Layer 3: Outline Text In Front of the Headset */}
        {appState === 'idle' && (
          <div className="absolute top-12 md:top-16 left-0 right-0 z-20 pointer-events-none select-none px-6 md:px-12 lg:px-16">
            <div className="flex flex-col items-stretch w-full">
              <SpannedText text="an MNET experience" className="text-transparent text-stroke-slate text-sm sm:text-base md:text-lg lg:text-xl font-bold" />
              <h1 className="flex justify-between w-full text-[13vw] font-black uppercase leading-none text-transparent text-stroke-slate">
                {"BrainXR".split("").map((char, index) => (
                  <span key={index}>{char}</span>
                ))}
              </h1>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* HOMEPAGE IDLE INTERFACE                                  */}
        {/* ======================================================== */}
        {appState === 'idle' && (
          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center z-30 px-6">
            <div className="backdrop-blur-md">

              <div className="flex flex-col gap-2">
                <button
                  onClick={startDemoMode}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-6 rounded-full transition-all shadow-md active:scale-[0.99]"
                >
                  Run Demo Mode
                </button>

                <button
                  onClick={startLiveMode}
                  className="text-slate-600 hover:text-slate-700 text-sm font-semibold mt-1 transition-colors hover:underline"
                >
                  Connect your EEG headset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEMO MODE FLOATING BOTTOM TIMELINE */}
        {appState === 'demo' && (
          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center z-30 px-8 pointer-events-none">
            <div className="w-full max-w-3xl pointer-events-auto">
              <TrialProgressBar
                trialElapsed={currentFrame.trialElapsed ?? 0}
                phase={currentFrame.phase}
                trialIndex={currentFrame.trialIndex ?? 0}
                playbackSpeed={playbackSpeed}
                onSpeedChange={setPlaybackSpeed}
                onTrialSelect={handleTrialSelect}
              />
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2D LAYOUT: RIGHT SIDEBAR (Electrode Inspector & Graph)   */}
      {/* ======================================================== */}
      {appState !== 'idle' && !(appState === 'live' && connectionStep < 2) && (
        <div className="w-full md:w-80 bg-white/95 border-t md:border-t-0 md:border-l border-slate-200 z-10 p-5 flex flex-col justify-between overflow-y-auto backdrop-blur-md">

          {/* Active Inspector Panel */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Electrode Inspector
            </h3>

            {activeMetadata ? (
              <div className="flex-1 flex flex-col space-y-4">
                {/* Channel Pill Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                      {activeMetadata.name}
                    </span>
                    <span className="text-xs text-slate-400 block font-medium mt-0.5">
                      {activeMetadata.fullName}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full">
                    {activeMetadata.region} Region
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {activeMetadata.description}
                </p>

                {/* Oscilloscope Graph */}
                <div className="h-40 w-full mt-2">
                  <SignalGraph
                    valueHistory={valueHistory}
                    color={graphColorForPhase(currentFrame.phase)}
                    label={activeMetadata.name}
                  />
                </div>

                {/* Impedance breakdown, Quality Check only */}
                {currentFrame.phase === 'quality-check' && selectedChannel && currentFrame.channels[selectedChannel] && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block">Impedance (kOhm)</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-bold">
                        {(currentFrame.channels[selectedChannel]?.impedance ?? 0).toFixed(2)} kΩ
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${currentFrame.channels[selectedChannel]?.quality === 'good' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        currentFrame.channels[selectedChannel]?.quality === 'fair' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                        {currentFrame.channels[selectedChannel]?.quality}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs text-center border-2 border-dashed border-slate-100 rounded-xl p-4">
                Click any sensor node on the headset to display telemetry readout.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default R3F;
