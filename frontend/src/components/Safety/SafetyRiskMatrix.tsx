import React from 'react';
import { AircraftTelemetry } from '../../types';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

interface SafetyRiskMatrixProps {
  telemetry: AircraftTelemetry;
}

export const SafetyRiskMatrix: React.FC<SafetyRiskMatrixProps> = ({ telemetry }) => {
  // ICAO 5x5 Matrix definition
  const severities = [
    { code: 'A', name: 'Catastrophic' },
    { code: 'B', name: 'Hazardous' },
    { code: 'C', name: 'Major' },
    { code: 'D', name: 'Minor' },
    { code: 'E', name: 'Negligible' }
  ];

  const likelihoods = [
    { code: '5', name: 'Frequent' },
    { code: '4', name: 'Probable' },
    { code: '3', name: 'Remote' },
    { code: '2', name: 'Extremely Remote' },
    { code: '1', name: 'Extremely Improbable' }
  ];

  // Map risk level: 'HIGH' | 'MED' | 'LOW'
  const getMatrixCellClass = (sIdx: number, lIdx: number) => {
    const riskScore = (5 - sIdx) * (5 - lIdx);
    if (riskScore >= 15) return 'bg-hud-crimson/25 border-hud-crimson/50 text-hud-crimson';
    if (riskScore >= 8) return 'bg-hud-amber/20 border-hud-amber/50 text-hud-amber';
    return 'bg-hud-emerald/10 border-hud-emerald/30 text-hud-emerald';
  };

  // Determine current flight coordinate on 5x5 matrix
  const activeSIdx = telemetry.riskScore > 60 ? 1 : telemetry.riskScore > 30 ? 2 : 3;
  const activeLIdx = telemetry.riskScore > 60 ? 2 : telemetry.riskScore > 30 ? 3 : 4;

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-hud-crimson" />
          <div>
            <h3 className="font-display font-bold text-base text-white">
              ICAO SMS 5×5 HAZARD RISK ASSESSMENT MATRIX
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              International Civil Aviation Organization (Doc 9859) Safety Management Framework
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">ACTIVE FLIGHT RATING:</span>
          <span className={`px-2.5 py-1 rounded font-bold ${
            telemetry.riskScore > 50 
              ? 'bg-hud-crimson/20 border border-hud-crimson/50 text-hud-crimson animate-pulse' 
              : 'bg-hud-emerald/10 border border-hud-emerald/30 text-hud-emerald'
          }`}>
            RISK INDEX {telemetry.riskScore}/100
          </span>
        </div>
      </div>

      {/* 5x5 Matrix Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header Row: Likelihoods */}
          <div className="grid grid-cols-6 gap-2 text-center text-xs font-mono font-bold text-slate-400 mb-2">
            <div className="text-left text-slate-500 text-[10px] self-end">SEVERITY ↓ / LIKELIHOOD →</div>
            {likelihoods.map(l => (
              <div key={l.code} className="p-1 rounded bg-aerospace-900/60 border border-slate-800">
                <span className="text-white block">{l.code}</span>
                <span className="text-[9px] text-slate-400 font-normal">{l.name}</span>
              </div>
            ))}
          </div>

          {/* Rows: Severities */}
          {severities.map((s, sIdx) => (
            <div key={s.code} className="grid grid-cols-6 gap-2 mb-2 items-center text-xs font-mono">
              <div className="p-2 rounded bg-aerospace-900/60 border border-slate-800 text-left">
                <span className="font-bold text-white block">{s.code}</span>
                <span className="text-[10px] text-slate-400">{s.name}</span>
              </div>

              {likelihoods.map((l, lIdx) => {
                const isCurrentFlightTarget = sIdx === activeSIdx && lIdx === activeLIdx;
                const cellClass = getMatrixCellClass(sIdx, lIdx);

                return (
                  <div
                    key={`${s.code}-${l.code}`}
                    className={`h-12 rounded-xl border flex flex-col items-center justify-center relative transition-all ${cellClass} ${
                      isCurrentFlightTarget ? 'ring-2 ring-hud-cyan shadow-hud-glow scale-105 z-10' : ''
                    }`}
                  >
                    <span className="font-bold text-xs">{s.code}{l.code}</span>
                    {isCurrentFlightTarget && (
                      <span className="absolute -bottom-1 px-1.5 py-0.2 rounded bg-hud-cyan text-black font-bold text-[8px] animate-pulse">
                        {telemetry.flightNumber}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
