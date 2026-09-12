import React, { useState } from 'react';
import { AircraftTelemetry } from '../../types';
import { Aircraft3DModel } from './Aircraft3DModel';
import { SubsystemInspector } from './SubsystemInspector';
import { FaultInjectionSimulator } from './FaultInjectionSimulator';
import { Box, Layers, Sliders, Activity, Sparkles, Wrench } from 'lucide-react';

interface DigitalTwinViewProps {
  telemetry: AircraftTelemetry;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({ telemetry }) => {
  const [selectedSubsystemId, setSelectedSubsystemId] = useState<string | null>(null);
  const [isExploded, setIsExploded] = useState<boolean>(false);

  return (
    <div className="space-y-5">
      {/* Title & Exploded View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-hud-emerald/15 border border-hud-emerald/40 text-hud-emerald shadow-hud-glow-green">
              <Box className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                DIGITAL TWIN 3D AIRCRAFT & SUBSYSTEM DIAGNOSTICS
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                High-Fidelity WebGL Airframe Simulation • Real-Time Structural & Thermal Telemetry Synchronization
              </p>
            </div>
          </div>
        </div>

        {/* Exploded View Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all ${
              isExploded
                ? 'bg-hud-cyan text-black shadow-hud-glow'
                : 'bg-aerospace-900 border border-hud-cyan/40 text-hud-cyan hover:bg-hud-cyan/20'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isExploded ? 'COLLAPSE AIRFRAME' : 'EXPLODE SUBSYSTEMS'}</span>
          </button>
        </div>
      </div>

      {/* 3D Model WebGL Canvas */}
      <Aircraft3DModel
        telemetry={telemetry}
        selectedSubsystemId={selectedSubsystemId}
        onSelectSubsystem={setSelectedSubsystemId}
        isExploded={isExploded}
      />

      {/* Subsystem Component Inspector */}
      <SubsystemInspector
        telemetry={telemetry}
        selectedSubsystemId={selectedSubsystemId}
        onSelectSubsystem={setSelectedSubsystemId}
      />

      {/* Fault Injection Simulator */}
      <FaultInjectionSimulator telemetry={telemetry} />
    </div>
  );
};
