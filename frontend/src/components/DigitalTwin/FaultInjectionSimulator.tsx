import React from 'react';
import { AircraftTelemetry } from '../../types';
import { FaultType, telemetryEngine } from '../../services/telemetryEngine';
import { Flame, Droplet, Zap, Wind, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';

interface FaultInjectionSimulatorProps {
  telemetry: AircraftTelemetry;
}

export const FaultInjectionSimulator: React.FC<FaultInjectionSimulatorProps> = ({ telemetry }) => {
  const { fault: activeFault } = telemetryEngine.getActiveFault();

  const scenarios: {
    type: FaultType;
    title: string;
    description: string;
    icon: typeof Flame;
    color: string;
    severity: string;
    cascadeImpact: string;
  }[] = [
    {
      type: 'HPT_THERMAL_CREEP',
      title: 'HPT Blade Thermal Creep & Vibration Spike',
      description: 'Simulates Stage 1 High Pressure Turbine blade coating erosion. EGT surges to 885°C with N2 shaft vibration exceeding 2.4 mm/s.',
      icon: Flame,
      color: 'border-red-500/40 text-red-400 hover:border-red-400',
      severity: 'CRITICAL WARNING',
      cascadeImpact: 'Triggers Master Warning, auto-derates Engine 2 thrust, dispatches MRO Borescope work order.'
    },
    {
      type: 'HYD_LEAK_CIRCUIT_B',
      title: 'Hydraulic Circuit B Rapid Pressure Loss',
      description: 'Simulates high-pressure return line hydraulic seal rupture. System B pressure plummets from 3000 to 1420 PSI.',
      icon: Droplet,
      color: 'border-amber-500/40 text-amber-400 hover:border-amber-400',
      severity: 'SYSTEM CAUTION',
      cascadeImpact: 'Auto-activates PTU isolation, alerts crew to prepare alternate landing gear gravity extension.'
    },
    {
      type: 'FUEL_NOZZLE_CLOG',
      title: 'Engine 1 Fuel Manifold Clogging',
      description: 'Simulates fuel injector nozzle carbon buildup. Fuel flow decreases by 24% causing localized combustion asymmetry.',
      icon: Zap,
      color: 'border-yellow-500/40 text-yellow-400 hover:border-yellow-400',
      severity: 'SYSTEM ADVISORY',
      cascadeImpact: 'Prompts FADEC fuel trimming, initiates fuel cross-feed balancing alert.'
    },
    {
      type: 'PITOT_STATIC_DRIFT',
      title: 'Pitot Probe #2 Dynamic Airspeed Disparity',
      description: 'Simulates icing on secondary pitot-static tube. Airspeed disagree warning between Captain PFD and Standby indicator.',
      icon: Wind,
      color: 'border-blue-500/40 text-blue-400 hover:border-blue-400',
      severity: 'AVIONICS CAUTION',
      cascadeImpact: 'Switches primary air data reference to ADR 3 and engages EFIS disagree comparator flag.'
    }
  ];

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-hud-crimson/20 border border-hud-crimson/40 text-hud-crimson">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">
              FAILURE IMPACT & FAULT INJECTION SIMULATOR
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Simulate cascading aerospace system failures in real-time on the 3D Digital Twin and live telemetry.
            </p>
          </div>
        </div>

        {activeFault !== 'NONE' && (
          <button
            onClick={() => telemetryEngine.clearFault()}
            className="px-3 py-1.5 rounded-xl bg-hud-emerald/20 border border-hud-emerald/40 hover:bg-hud-emerald/30 text-hud-emerald font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-hud-glow-green"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>RESET TO NOMINAL (CLEAR ALL FAULTS)</span>
          </button>
        )}
      </div>

      {/* Fault Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {scenarios.map((scen) => {
          const Icon = scen.icon;
          const isActive = activeFault === scen.type;

          return (
            <div
              key={scen.type}
              className={`p-4 rounded-xl border transition-all text-xs font-mono flex flex-col justify-between ${
                isActive
                  ? 'bg-hud-crimson/15 border-hud-crimson shadow-hud-glow-red'
                  : 'bg-aerospace-900/70 ' + scen.color
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Icon className="w-4 h-4" />
                    <span>{scen.title}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-hud-crimson text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {scen.severity}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
                  {scen.description}
                </p>
                <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2">
                  <b className="text-slate-400">CASCADE EFFECT:</b> {scen.cascadeImpact}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">TARGET: {telemetry.flightNumber}</span>
                {isActive ? (
                  <span className="px-3 py-1 rounded bg-hud-crimson text-white font-bold text-[11px] flex items-center gap-1 animate-pulse">
                    ● ACTIVE FAULT INJECTED
                  </span>
                ) : (
                  <button
                    onClick={() => telemetryEngine.injectFault(scen.type, telemetry.aircraftId)}
                    className="px-3 py-1 rounded bg-aerospace-900 border border-hud-cyan/40 hover:bg-hud-cyan hover:text-black text-hud-cyan font-bold text-[11px] transition-all"
                  >
                    Inject Scenario →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
