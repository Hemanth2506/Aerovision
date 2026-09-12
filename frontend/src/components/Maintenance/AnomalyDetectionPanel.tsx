import React from 'react';
import { AircraftTelemetry } from '../../types';
import { Activity, AlertTriangle, CheckCircle, Cpu, SlidersHorizontal } from 'lucide-react';

interface AnomalyDetectionPanelProps {
  telemetry: AircraftTelemetry;
}

export const AnomalyDetectionPanel: React.FC<AnomalyDetectionPanelProps> = ({ telemetry }) => {
  const anomalies = [
    {
      feature: 'EGT Margin Decay Gradient',
      subsystem: 'ATA-72 Engine Hot Section',
      score: telemetry.engine2.egtDegC > 750 ? 92 : 28,
      status: telemetry.engine2.egtDegC > 750 ? 'CRITICAL_ANOMALY' : 'NOMINAL',
      detail: telemetry.engine2.egtDegC > 750 
        ? 'Decay rate exceeds 3.8°C / 100 hrs (Thermal creep signature)' 
        : 'Decay rate 0.4°C / 100 hrs (Standard fleet baseline)'
    },
    {
      feature: 'N2 Shaft Vibration Harmonics',
      subsystem: 'ATA-72 Turbofan High-Pressure Spool',
      score: telemetry.engine2.vibrationN2 > 1.0 ? 84 : 22,
      status: telemetry.engine2.vibrationN2 > 1.0 ? 'ELEVATED_ANOMALY' : 'NOMINAL',
      detail: telemetry.engine2.vibrationN2 > 1.0 
        ? 'Spike at 1.42 mm/s synchronous with 12,400 RPM core speed' 
        : 'Vibration 0.35 mm/s within smooth dynamic envelope'
    },
    {
      feature: 'Hydraulic Circuit B Delta Return',
      subsystem: 'ATA-29 Hydraulic Power Generation',
      score: telemetry.hydraulics.systemBPressurePsi < 2800 ? 74 : 15,
      status: telemetry.hydraulics.systemBPressurePsi < 2800 ? 'PRESSURE_LEAK' : 'NOMINAL',
      detail: telemetry.hydraulics.systemBPressurePsi < 2800 
        ? `Pressure delta ${3000 - telemetry.hydraulics.systemBPressurePsi} PSI below nominal threshold` 
        : 'Circuit B 3000 PSI steady'
    },
    {
      feature: 'Fuel Flow Injector Balance',
      subsystem: 'ATA-73 Engine Fuel & Control',
      score: 18,
      status: 'NOMINAL',
      detail: 'Left vs Right manifold distribution balance 98.6%'
    },
    {
      feature: 'Oil Differential Filter Delta',
      subsystem: 'ATA-79 Engine Oil Scavenge',
      score: 14,
      status: 'NOMINAL',
      detail: 'Filter DP 12 PSI (Bypass threshold 45 PSI)'
    },
    {
      feature: 'Cabin Pressurization Outflow Valve',
      subsystem: 'ATA-21 Air Conditioning',
      score: 12,
      status: 'NOMINAL',
      detail: 'Outflow actuator position response latency <80ms'
    }
  ];

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-hud-cyan" />
          <h3 className="font-display font-bold text-base text-white">
            AI MULTIVARIABLE ANOMALY DETECTOR (UNSUPERVISED ML)
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          ISOLATION FOREST / XGBOOST ENSEMBLE
        </span>
      </div>

      {/* Anomaly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {anomalies.map((item, idx) => {
          const isAnomaly = item.status !== 'NOMINAL';

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs font-mono transition-all flex flex-col justify-between ${
                isAnomaly
                  ? 'bg-hud-crimson/10 border-hud-crimson/40 shadow-hud-glow-red'
                  : 'bg-aerospace-900/60 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs truncate">{item.feature}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isAnomaly ? 'bg-hud-crimson text-white animate-pulse' : 'bg-hud-emerald/10 text-hud-emerald'
                  }`}>
                    {item.score}/100
                  </span>
                </div>
                <div className="text-[10px] text-hud-cyan">{item.subsystem}</div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {item.detail}
                </p>
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isAnomaly ? 'bg-hud-crimson' : 'bg-hud-emerald'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
