import React from 'react';
import { FOQAExceedance } from '../../types';
import { INITIAL_FOQA_EXCEEDANCES } from '../../data/mockData';
import { Activity, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

export const FOQAExceedances: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-hud-crimson" />
          <h3 className="font-display font-bold text-base text-white">
            FOQA / FDM FLIGHT DATA MONITORING EXCEEDANCES
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          AUTOMATED QAR BLACK BOX TELEMETRY
        </span>
      </div>

      {/* Exceedances List */}
      <div className="space-y-3">
        {INITIAL_FOQA_EXCEEDANCES.map((item) => {
          const isCritical = item.severity === 'LEVEL_3_CRITICAL';
          const isWarning = item.severity === 'LEVEL_2';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border text-xs font-mono space-y-2 transition-all ${
                isCritical
                  ? 'bg-hud-crimson/15 border-hud-crimson/50 shadow-hud-glow-red'
                  : isWarning
                  ? 'bg-hud-amber/10 border-hud-amber/40'
                  : 'bg-aerospace-900/60 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-hud-cyan text-sm">{item.id}</span>
                  <span className="text-white font-bold">{item.flightNumber} ({item.aircraftModel})</span>
                  <span className="text-slate-400">• Phase: {item.phaseOfFlight}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    isCritical
                      ? 'bg-hud-crimson text-white animate-pulse'
                      : isWarning
                      ? 'bg-hud-amber/20 text-hud-amber'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.severity.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toUTCString().substring(17, 22)} UTC</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">{item.event}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded bg-aerospace-950/80 border border-slate-800">
                    <span className="text-slate-500 block">MEASURED VALUE:</span>
                    <span className="text-hud-amber font-bold">{item.measuredValue}</span>
                  </div>
                  <div className="p-2 rounded bg-aerospace-950/80 border border-slate-800">
                    <span className="text-slate-500 block">THRESHOLD LIMIT:</span>
                    <span className="text-slate-300">{item.thresholdLimit}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-2 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-hud-cyan shrink-0" />
                <span><b>SAFETY ASSESSMENT:</b> {item.riskAssessment}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
