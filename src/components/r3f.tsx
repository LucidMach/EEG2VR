import * as THREE from "three";
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { createXRStore, XR } from "@react-three/xr";
import EEGHead from "./eegHead";
import SignalGraph from "./SignalGraph";
import { generateEEGFrame, getElectrodeMetadata, EEG_CHANNELS } from "../utils/eegSimulator";

// Initialize WebXR store outside the component
const xrStore = createXRStore({
  depthSensing: false
});

// SpannedText component to span text letters across parent container width
interface SpannedTextProps {
  text: string;
  className?: string;
}

const SpannedText: React.FC<SpannedTextProps> = ({ text, className = "" }) => {
  return (
    <div className={`flex justify-between w-full font-offbit uppercase tracking-normal select-none ${className}`}>
      {text.split("").map((char, index) => (
        <span key={index}>{char === " " ? "\u00A0" : char}</span>
      ))}
    </div>
  );
};

// Component to dynamically adapt model for 2D vs. VR presentation
interface HeadWrapperProps {
  channelData: Record<string, any>;
  selectedChannel: string | null;
  onChannelSelect: (name: string) => void;
  activeMode: any;
  setMode: (mode: any) => void;
}

const HeadWrapper: React.FC<HeadWrapperProps> = ({
  channelData,
  selectedChannel,
  onChannelSelect,
  activeMode,
  setMode
}) => {
  const groupRef = useRef<THREE.Group>(null);

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

        if (activeMode === "idle") {
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
    if (selectedChannel && channelData[selectedChannel]) {
      return channelData[selectedChannel].value;
    }
    return 0;
  };

  return (
    <group>
      <EEGHead
        ref={groupRef}
        channelData={channelData}
        selectedChannel={selectedChannel}
        onChannelSelect={onChannelSelect}
        activeMode={activeMode}
        rotation={[Math.PI / 32, 0, 0]}
      />
      {/* Render 3D Floating Console in WebXR Mode only */}
      <XRConsoleWrapper
        activeMode={activeMode}
        setMode={setMode}
        selectedChannel={selectedChannel}
        currentValue={getSelectedChannelValue()}
      />
    </group>
  );
};

// Check if presenting in VR to show the floating 3D control board
const XRConsoleWrapper: React.FC<{
  activeMode: string;
  setMode: (mode: any) => void;
  selectedChannel: string | null;
  currentValue: number;
}> = ({ activeMode, setMode, selectedChannel, currentValue }) => {
  const [inVR, setInVR] = useState(false);

  useFrame((state) => {
    setInVR(state.gl.xr.isPresenting);
  });

  if (!inVR) return null;

  const modes = [
    { id: "delta", label: "Delta", color: "#0055ff" },
    { id: "theta", label: "Theta", color: "#00f0ff" },
    { id: "alpha", label: "Alpha", color: "#00ff55" },
    { id: "beta", label: "Beta", color: "#ffb700" },
    { id: "gamma", label: "Gamma", color: "#ff00aa" },
    { id: "quality", label: "Quality", color: "#ff3333" }
  ];

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

      {/* Sub-Title */}
      <Text
        position={[0, 0.13, 0.015]}
        fontSize={0.012}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        Select Telemetry Mode:
      </Text>

      {/* Interactive Mode Grid */}
      {modes.map((m, idx) => {
        const isSelected = activeMode === m.id;
        const x = idx % 2 === 0 ? -0.11 : 0.11;
        const y = 0.06 - Math.floor(idx / 2) * 0.075;

        return (
          <group
            key={m.id}
            position={[x, y, 0.015]}
            onClick={(e) => {
              e.stopPropagation();
              setMode(m.id);
            }}
          >
            <mesh>
              <boxGeometry args={[0.19, 0.05, 0.012]} />
              <meshStandardMaterial
                color={isSelected ? m.color : "#f1f5f9"}
                emissive={isSelected ? m.color : "#000000"}
                emissiveIntensity={isSelected ? 0.7 : 0.0}
                roughness={0.2}
              />
            </mesh>
            <Text
              position={[0, 0, 0.007]}
              fontSize={0.015}
              color={isSelected ? "#ffffff" : "#334155"}
              anchorX="center"
              anchorY="middle"
            >
              {m.label}
            </Text>
          </group>
        );
      })}

      {/* Sensor Monitor Box */}
      <group position={[0, -0.15, 0.015]}>
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

const R3F: React.FC = () => {
  // App Modes: 'idle' | 'demo' | 'live'
  const [appState, setAppState] = useState<'idle' | 'demo' | 'live'>('idle');

  // Active Telemetry View: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'quality'
  const [activeTelemetryMode, setActiveTelemetryMode] = useState<
    'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'quality' | 'normal'
  >('normal');

  // Channel Telemetry
  const [selectedChannel, setSelectedChannel] = useState<string | null>("Cz");
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);
  const [channelData, setChannelData] = useState<Record<string, any>>({});
  const [valueHistory, setValueHistory] = useState<number[]>([]);
  const historyLimit = 120;

  // Simulator loop time variable
  const timeRef = useRef<number>(0);

  // Live Mode Mocking States
  const [connectionStep, setConnectionStep] = useState<number>(0); // 0=searching, 1=checking, 2=connected
  const [connectedDevice, setConnectedDevice] = useState<string>("");

  // Initialize background data (idle state breathing)
  useEffect(() => {
    const frame = generateEEGFrame(0, 'normal');
    setChannelData(frame.channels);
  }, []);

  // Simulator Data Loop
  useEffect(() => {
    if (appState === 'idle') {
      // In idle, generate soft breathing data values
      const timer = setInterval(() => {
        timeRef.current += 0.05;
        const frame = generateEEGFrame(timeRef.current, 'normal');
        setChannelData(frame.channels);
      }, 50);
      return () => clearInterval(timer);
    }

    if (appState === 'demo' || (appState === 'live' && connectionStep === 2)) {
      const mode = activeTelemetryMode;
      const timer = setInterval(() => {
        timeRef.current += 0.05;
        const frame = generateEEGFrame(timeRef.current, mode);

        setChannelData(frame.channels);

        // Record history for the selected electrode graph
        if (selectedChannel) {
          const val = frame.channels[selectedChannel]?.value || 0;
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
    }
  }, [appState, activeTelemetryMode, selectedChannel, connectionStep]);

  // Clean value history on switching channel
  useEffect(() => {
    setValueHistory([]);
  }, [selectedChannel]);

  // Start Demo Mode
  const startDemoMode = () => {
    setAppState('demo');
    setActiveTelemetryMode('alpha'); // Default demo telemetry to alpha
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
        setActiveTelemetryMode('quality'); // Start in quality check
        setSelectedChannel("Cz");
      }, 2500);
    }, 2000);
  };

  const disconnectHeadset = () => {
    setAppState('idle');
    setActiveTelemetryMode('normal');
    setSelectedChannel("Cz");
    setConnectedDevice("");
  };

  const getActiveStateColor = () => {
    switch (activeTelemetryMode) {
      case 'delta': return 'bg-blue-600 text-white';
      case 'theta': return 'bg-cyan-500 text-slate-900';
      case 'alpha': return 'bg-emerald-500 text-white';
      case 'beta': return 'bg-amber-500 text-slate-900';
      case 'gamma': return 'bg-pink-600 text-white';
      case 'quality': return 'bg-red-500 text-white';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  const activeMetadata = selectedChannel ? getElectrodeMetadata(selectedChannel) : null;

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative bg-white overflow-hidden text-slate-800 font-sans">

      {/* ======================================================== */}
      {/* 2D LAYOUT: LEFT SIDEBAR (Controls & Band Selector)      */}
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

            {/* Frequency Bands Selector */}
            {!(appState === 'live' && connectionStep < 2) && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brainwave Bands</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'delta', label: 'Delta', freq: '0.5-4 Hz', desc: 'Deep Sleep', color: 'border-blue-500 text-blue-600' },
                    { id: 'theta', label: 'Theta', freq: '4-8 Hz', desc: 'Meditation', color: 'border-cyan-500 text-cyan-600' },
                    { id: 'alpha', label: 'Alpha', freq: '8-12 Hz', desc: 'Calm Focus', color: 'border-emerald-500 text-emerald-600' },
                    { id: 'beta', label: 'Beta', freq: '12-30 Hz', desc: 'Active Focus', color: 'border-amber-500 text-amber-600' },
                    { id: 'gamma', label: 'Gamma', freq: '30-100 Hz', desc: 'High Cognition', color: 'border-pink-500 text-pink-600' },
                  ].map((band) => (
                    <button
                      key={band.id}
                      onClick={() => setActiveTelemetryMode(band.id as any)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${activeTelemetryMode === band.id
                        ? `bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]`
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <span className="text-sm font-bold">{band.label}</span>
                      <span className="text-[10px] opacity-75">{band.freq}</span>
                      <span className="text-[9px] mt-1 font-mono tracking-tight opacity-90">{band.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Connection Quality check mode button */}
                <button
                  onClick={() => setActiveTelemetryMode('quality')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all mt-4 ${activeTelemetryMode === 'quality'
                    ? 'bg-red-500 border-red-500 text-white shadow-md scale-[1.02]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  <div>
                    <span className="text-sm font-bold block">Signal Quality Check</span>
                    <span className="text-[10px] opacity-80">Impedance telemetry (kOhm)</span>
                  </div>
                  <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full font-mono">32 Ch</span>
                </button>
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
            <span>Value: {(channelData[hoveredChannel]?.value || 0).toFixed(2)} µV</span>
            <span>Impedance: {(channelData[hoveredChannel]?.impedance || 0).toFixed(1)} kΩ</span>
            <span className="capitalize">Quality: {channelData[hoveredChannel]?.quality}</span>
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
                channelData={channelData}
                selectedChannel={selectedChannel}
                onChannelSelect={setSelectedChannel}
                activeMode={appState === 'idle' ? 'idle' : activeTelemetryMode}
                setMode={setActiveTelemetryMode}
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
                    color={
                      activeTelemetryMode === 'delta' ? '#2563eb' :
                        activeTelemetryMode === 'theta' ? '#06b6d4' :
                          activeTelemetryMode === 'alpha' ? '#10b981' :
                            activeTelemetryMode === 'beta' ? '#f59e0b' :
                              activeTelemetryMode === 'gamma' ? '#db2777' :
                                activeTelemetryMode === 'quality' ? '#ef4444' : '#10b981'
                    }
                    label={activeMetadata.name}
                  />
                </div>

                {/* Spectral / Impedance breakdown */}
                {channelData[selectedChannel || ""] && (
                  <div className="space-y-3 pt-3">
                    {activeTelemetryMode === 'quality' ? (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase block">Impedance (kOhm)</span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xl font-bold">
                            {(channelData[selectedChannel || ""]?.impedance).toFixed(2)} kΩ
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${channelData[selectedChannel || ""]?.quality === 'good' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                            channelData[selectedChannel || ""]?.quality === 'fair' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                              'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                            {channelData[selectedChannel || ""]?.quality}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase block">Spectral Power Distribution</span>
                        {Object.entries(channelData[selectedChannel || ""]?.frequencies || {}).map(([band, val]: any) => (
                          <div key={band} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-medium text-slate-500 capitalize">
                              <span>{band}</span>
                              <span className="font-mono">{(val * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${band === 'delta' ? 'bg-blue-500' :
                                  band === 'theta' ? 'bg-cyan-400' :
                                    band === 'alpha' ? 'bg-emerald-400' :
                                      band === 'beta' ? 'bg-amber-400' : 'bg-pink-500'
                                  }`}
                                style={{ width: `${val * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
