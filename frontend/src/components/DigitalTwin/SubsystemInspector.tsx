import React from 'react';
import { AircraftTelemetry, AircraftSubsystemHealth } from '../../types';
import { Cpu, AlertTriangle, ShieldCheck, Clock, Activity, Flame, Droplet, Layers, Wrench } from 'lucide-react';

interface SubsystemInspectorProps {
  telemetry: AircraftTelemetry;
  selectedSubsystemId: string | null;
  onSelectSubsystem: (id: string) => void;
}

export const SubsystemInspector: React.FC<SubsystemInspectorProps> = ({
  telemetry,
  selectedSubsystemId,
  onSelectSubsystem
}) => {
  const subsystems = telemetry.subsystems && telemetry.subsystems.length > 0
    ? telemetry.subsystems
    : [
        {
          id: 'SUB-72-GEN',
          name: 'CFM LEAP-1A / Trent XWB Turbofan Pair',
          ataChapter: 'ATA-72 Engine',
          healthScore: telemetry.overallHealthScore,
          rulHours: 3200,
          rulCycles: 1100,
          failureProbability: 0.04,
          status: 'OPTIMAL' as const,
          vibrationMmSec: telemetry.engine1.vibrationN1,
          temperatureC: telemetry.engine1.egtDegC,
          pressurePsi: telemetry.engine1.oilPressurePsi,
          lastOverhaulDate: '2026-01-15',
          nextScheduledCheck: '2026-10-10',
          anomaliesDetected: []
        },
        {
          id: 'SUB-29-GEN',
          name: 'Hydraulic Power Distribution 3000 PSI',
          ataChapter: 'ATA-29 Hydraulic Power',
          healthScore: 95,
          rulHours: 4800,
          rulCycles: 2100,
          failureProbability: 0.02,
          status: 'OPTIMAL' as const,
          vibrationMmSec: 0.15,
          temperatureC: telemetry.hydraulics.fluidTempC,
          pressurePsi: telemetry.hydraulics.systemAPressurePsi,
          lastOverhaulDate: '2025-12-01',
          nextScheduledCheck: '2026-12-01',
          anomaliesDetected: []
        }
      ];

  const activeSubsystem = subsystems.find(s => s.id === selectedSubsystemId) || subsystems[0];

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-hud-cyan" />
          <h3 className="font-display font-bold text-base text-white">
            SUBSYSTEM COMPONENT DIAGNOSTICS
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          ATA CHAPTER SPECIFICATIONS
        </span>
      </div>

      {/* Subsystem Tabs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {subsystems.map((sub) => {
          const isSelected = sub.id === activeSubsystem.id;
          const isWarning = sub.status === 'WARNING' || sub.healthScore < 75;

          return (
            <button
              key={sub.id}
              onClick={() => onSelectSubsystem(sub.id)}
              className={`p-3 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-hud-cyan/15 border-hud-cyan shadow-hud-glow text-white'
                  : 'bg-aerospace-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-xs font-mono truncate">{sub.name}</div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                  sub.healthScore > 85 
                    ? 'bg-hud-emerald/10 text-hud-emerald' 
                    : isWarning 
                    ? 'bg-hud-crimson/20 text-hud-crimson animate-pulse' 
                    : 'bg-hud-amber/10 text-hud-amber'
                }`}>
                  {sub.healthScore}%
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">{sub.ataChapter}</div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-800/60">
                <span>RUL: <b className="text-slate-300">{sub.rulHours} hrs</b></span>
                <span>FAIL PROB: <b className={sub.failureProbability > 0.15 ? 'text-hud-crimson' : 'text-slate-300'}>{(sub.failureProbability * 100).toFixed(0)}%</b></span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Inspection Card for Selected Subsystem */}
      {activeSubsystem && (
        <div className="p-4 rounded-xl bg-aerospace-900/90 border border-hud-cyan/30 text-xs font-mono space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <span className="text-[10px] text-hud-cyan font-bold block">{activeSubsystem.ataChapter}</span>
              <span className="text-sm font-bold text-white">{activeSubsystem.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">STATUS:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                activeSubsystem.status === 'OPTIMAL'
                  ? 'bg-hud-emerald/20 text-hud-emerald'
                  : 'bg-hud-crimson/20 text-hud-crimson animate-pulse'
              }`}>
                {activeSubsystem.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-aerospace-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">VIBRATION (N2/PEAK):</span>
              <span className={`text-sm font-bold ${activeSubsystem.vibrationMmSec > 1.0 ? 'text-hud-crimson' : 'text-hud-emerald'}`}>
                {activeSubsystem.vibrationMmSec} mm/s
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-aerospace-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">OPERATING TEMP:</span>
              <span className="text-sm font-bold text-white">{activeSubsystem.temperatureC}°C</span>
            </div>
            <div className="p-2.5 rounded-lg bg-aerospace-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">SYSTEM PRESSURE:</span>
              <span className="text-sm font-bold text-white">{activeSubsystem.pressurePsi} PSI</span>
            </div>
            <div className="p-2.5 rounded-lg bg-aerospace-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">RUL CYCLES REMAINING:</span>
              <span className="text-sm font-bold text-hud-cyan">{activeSubsystem.rulCycles} Cycles</span>
            </div>
          </div>

          {/* Anomaly Callout Box */}
          {activeSubsystem.anomaliesDetected && activeSubsystem.anomaliesDetected.length > 0 ? (
            <div className="p-3 rounded-lg bg-hud-crimson/10 border border-hud-crimson/30 space-y-1">
              <div className="flex items-center gap-1.5 text-hud-crimson font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>AI PREDICTIVE ANOMALY SIGNATURES:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5 pl-1">
                {activeSubsystem.anomaliesDetected.map((anom, i) => (
                  <li key={i}>{anom}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-hud-emerald/5 border border-hud-emerald/20 flex items-center gap-2 text-hud-emerald text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>No active telemetry anomalies detected. Operating within standard Boeing / Airbus OEM envelopes.</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 pt-1">
            <span>LAST MAJOR OVERHAUL: {activeSubsystem.lastOverhaulDate}</span>
            <span>NEXT SCHEDULED C-CHECK: {activeSubsystem.nextScheduledCheck}</span>
          </div>
        </div>
      )}
    </div>
  );
};
