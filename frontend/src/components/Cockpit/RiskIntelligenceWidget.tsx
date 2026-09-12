import React from 'react';
import { AircraftTelemetry, RiskFactor } from '../../types';
import { ShieldAlert, TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RiskIntelligenceWidgetProps {
  telemetry: AircraftTelemetry;
}

export const RiskIntelligenceWidget: React.FC<RiskIntelligenceWidgetProps> = ({ telemetry }) => {
  const isDanger = telemetry.safetyStatus === 'DANGER' || telemetry.riskScore > 60;
  const isCaution = telemetry.safetyStatus === 'CAUTION' || telemetry.riskScore > 30;

  const factors: RiskFactor[] = telemetry.contributingRiskFactors && telemetry.contributingRiskFactors.length > 0
    ? telemetry.contributingRiskFactors
    : [
        { name: 'Weather Threat Matrix', impactScore: isDanger ? 54 : 12, category: 'WEATHER', description: isDanger ? 'Convective thunderstorm cell in sector' : 'Clear oceanic airway', severity: isDanger ? 'DANGER' : 'SAFE' },
        { name: 'Technical & Engine Health', impactScore: telemetry.overallHealthScore < 80 ? 32 : 8, category: 'TECHNICAL', description: telemetry.overallHealthScore < 80 ? 'EGT margin threshold degraded' : 'Dual FADEC nominal', severity: telemetry.overallHealthScore < 80 ? 'CAUTION' : 'SAFE' },
        { name: 'Airspace Separation Buffer', impactScore: 10, category: 'AIRSPACE', description: 'ICAO 5NM lateral separation maintained', severity: 'SAFE' }
      ];

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${
            isDanger ? 'bg-hud-crimson/20 border-hud-crimson/50 text-hud-crimson animate-pulse' : 'bg-hud-cyan/20 border-hud-cyan/40 text-hud-cyan'
          }`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">
              REAL-TIME RISK INTELLIGENCE ENGINE
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Continuous Flight Envelope Hazard Matrix (0 – 100 Index)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[10px]">TREND:</span>
          <span className={`flex items-center gap-1 font-bold ${
            telemetry.riskTrend === 'IMPROVING' ? 'text-hud-emerald' : telemetry.riskTrend === 'DEGRADING' ? 'text-hud-crimson' : 'text-slate-300'
          }`}>
            {telemetry.riskTrend === 'IMPROVING' ? <TrendingDown className="w-3.5 h-3.5" /> : telemetry.riskTrend === 'DEGRADING' ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            <span>{telemetry.riskTrend}</span>
          </span>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Risk Score */}
        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center ${
          isDanger 
            ? 'bg-hud-crimson/15 border-hud-crimson shadow-hud-glow-red' 
            : isCaution 
            ? 'bg-hud-amber/15 border-hud-amber shadow-hud-glow-amber' 
            : 'bg-aerospace-900/80 border-slate-800'
        }`}>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">TOTAL RISK SCORE</span>
          <span className={`text-4xl font-display font-bold tracking-tight ${
            isDanger ? 'text-hud-crimson animate-pulse' : isCaution ? 'text-hud-amber' : 'text-hud-emerald'
          }`}>
            {telemetry.riskScore}
            <span className="text-sm font-normal text-slate-400">/100</span>
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold mt-2 ${
            isDanger ? 'bg-hud-crimson text-white' : isCaution ? 'bg-hud-amber text-black' : 'bg-hud-emerald text-black'
          }`}>
            {telemetry.riskCategory} HAZARD
          </span>
        </div>

        {/* Contributing Factors Breakdown */}
        <div className="sm:col-span-2 space-y-2.5 p-3 rounded-xl bg-aerospace-900/70 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold flex justify-between">
            <span>CONTRIBUTING RISK FACTORS:</span>
            <span>IMPACT WEIGHT</span>
          </div>

          <div className="space-y-2">
            {factors.map((f, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-white font-bold">{f.name}</span>
                  <span className={`font-bold ${
                    f.severity === 'DANGER' ? 'text-hud-crimson' : f.severity === 'CAUTION' ? 'text-hud-amber' : 'text-hud-emerald'
                  }`}>
                    {f.impactScore}% ({f.severity})
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      f.severity === 'DANGER' ? 'bg-hud-crimson' : f.severity === 'CAUTION' ? 'bg-hud-amber' : 'bg-hud-emerald'
                    }`}
                    style={{ width: `${f.impactScore}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-400">{f.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
