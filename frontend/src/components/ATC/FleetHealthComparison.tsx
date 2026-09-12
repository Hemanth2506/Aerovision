import React, { useState } from 'react';
import { AircraftTelemetry } from '../../types';
import { Box, ShieldAlert, Cpu, ArrowUpDown, ChevronRight, Activity, Flame } from 'lucide-react';

interface FleetHealthComparisonProps {
  fleet: AircraftTelemetry[];
  activeAircraftId: string;
  onSelectAircraft: (aircraftId: string) => void;
  onOpenReroute?: (aircraft: AircraftTelemetry) => void;
}

export const FleetHealthComparison: React.FC<FleetHealthComparisonProps> = ({
  fleet,
  activeAircraftId,
  onSelectAircraft,
  onOpenReroute
}) => {
  const [sortKey, setSortKey] = useState<'risk' | 'health' | 'flight'>('risk');

  const sortedFleet = [...fleet].sort((a, b) => {
    if (sortKey === 'risk') return b.riskScore - a.riskScore;
    if (sortKey === 'health') return a.overallHealthScore - b.overallHealthScore;
    return a.flightNumber.localeCompare(b.flightNumber);
  });

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Box className="w-5 h-5 text-hud-cyan" />
          <div>
            <h3 className="font-display font-bold text-base text-white">
              TOWER FLEET-WIDE DIGITAL TWINS & RISK RANKING
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Real-time multi-aircraft telemetry comparison & predictive airframe hazard scoring
            </p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 bg-aerospace-900/90 border border-slate-800 rounded-xl p-1">
          <span className="text-[10px] text-slate-500 uppercase px-2 font-bold">SORT:</span>
          <button
            onClick={() => setSortKey('risk')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              sortKey === 'risk' ? 'bg-hud-crimson/20 border border-hud-crimson/50 text-hud-crimson font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Highest Risk
          </button>
          <button
            onClick={() => setSortKey('health')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              sortKey === 'health' ? 'bg-hud-amber/20 border border-hud-amber/50 text-hud-amber font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Degraded Health
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
              <th className="pb-3 px-3">Flight / Tail</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3">Airframe Model</th>
              <th className="pb-3 px-3">Engine 1 / Engine 2 EGT</th>
              <th className="pb-3 px-3">Hydraulics (PSI)</th>
              <th className="pb-3 px-3">Health Score</th>
              <th className="pb-3 px-3">Risk Rating</th>
              <th className="pb-3 px-3 text-right">ATC Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedFleet.map((ac) => {
              const isSelected = ac.aircraftId === activeAircraftId;
              const isDanger = ac.safetyStatus === 'DANGER';

              return (
                <tr
                  key={ac.aircraftId}
                  onClick={() => onSelectAircraft(ac.aircraftId)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-hud-cyan/15 border-l-4 border-l-hud-cyan text-white'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className={isSelected ? 'text-hud-cyan font-bold' : ''}>{ac.flightNumber}</span>
                      <span className="text-[10px] text-slate-400">({ac.tailNumber})</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{ac.originIata} → {ac.destIata}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ac.safetyStatus === 'DANGER'
                        ? 'bg-hud-crimson text-white animate-pulse'
                        : ac.safetyStatus === 'CAUTION'
                        ? 'bg-hud-amber/20 text-hud-amber'
                        : 'bg-hud-emerald/20 text-hud-emerald'
                    }`}>
                      {ac.safetyStatus}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">{ac.model}</div>
                    <div className="text-[10px] text-slate-500">FL{(ac.altitudeFt/100).toFixed(0)} • {ac.groundSpeedKnots} kts</div>
                  </td>

                  <td className="py-3 px-3">
                    <div>{ac.engine1.egtDegC}°C / <b className={ac.engine2.egtDegC > 750 ? 'text-hud-crimson' : 'text-slate-200'}>{ac.engine2.egtDegC}°C</b></div>
                    <div className="text-[10px] text-slate-400">Margin: {ac.engine2.egtMarginDegC}°C</div>
                  </td>

                  <td className="py-3 px-3">
                    <div>A: {ac.hydraulics.systemAPressurePsi} | B: <b className={ac.hydraulics.systemBPressurePsi < 2600 ? 'text-hud-amber' : ''}>{ac.hydraulics.systemBPressurePsi}</b></div>
                    <div className="text-[10px] text-slate-400">Temp: {ac.hydraulics.fluidTempC}°C</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            ac.overallHealthScore > 85 ? 'bg-hud-emerald' : 'bg-hud-amber'
                          }`}
                          style={{ width: `${ac.overallHealthScore}%` }}
                        />
                      </div>
                      <span className="font-bold">{ac.overallHealthScore}%</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`font-bold ${
                      ac.riskScore > 60 ? 'text-hud-crimson' : ac.riskScore > 30 ? 'text-hud-amber' : 'text-hud-emerald'
                    }`}>
                      {ac.riskScore}/100 ({ac.riskCategory})
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    {isDanger && !ac.isRerouted && onOpenReroute ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReroute(ac);
                        }}
                        className="px-2.5 py-1 rounded bg-hud-emerald text-black font-bold hover:bg-hud-emerald/90 transition-all text-[10px] inline-flex items-center gap-1 shadow-hud-glow-green animate-pulse"
                      >
                        <span>AI Reroute</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAircraft(ac.aircraftId);
                        }}
                        className="px-2.5 py-1 rounded bg-aerospace-900 border border-hud-cyan/40 hover:bg-hud-cyan hover:text-black font-bold text-[10px] text-hud-cyan transition-all inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
