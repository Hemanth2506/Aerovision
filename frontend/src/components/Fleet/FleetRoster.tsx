import React, { useState } from 'react';
import { AircraftTelemetry, AircraftStatus } from '../../types';
import { Search, Filter, ArrowUpDown, Plane, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

interface FleetRosterProps {
  fleet: AircraftTelemetry[];
  activeAircraftId: string;
  onSelectAircraft: (aircraftId: string) => void;
}

export const FleetRoster: React.FC<FleetRosterProps> = ({
  fleet,
  activeAircraftId,
  onSelectAircraft
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredFleet = fleet.filter(ac => {
    const matchesSearch = 
      ac.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.tailNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.originIata.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.destIata.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || ac.phase === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-display font-bold text-base text-white">
          <Plane className="w-5 h-5 text-hud-cyan" />
          <span>COMMERCIAL FLEET ROSTER ({filteredFleet.length} OF {fleet.length})</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search flight, tail, airport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-aerospace-900 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-hud-cyan w-60"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-aerospace-900 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            {['ALL', 'CRUISING', 'AIRBORNE'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-hud-cyan/20 border border-hud-cyan/40 text-hud-cyan font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Grid / Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="pb-3 px-3">Flight / Tail</th>
              <th className="pb-3 px-3">Aircraft Model</th>
              <th className="pb-3 px-3">Route</th>
              <th className="pb-3 px-3">Altitude & Speed</th>
              <th className="pb-3 px-3">Phase</th>
              <th className="pb-3 px-3">Health Score</th>
              <th className="pb-3 px-3">Risk Level</th>
              <th className="pb-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredFleet.map((ac) => {
              const isSelected = ac.aircraftId === activeAircraftId;

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
                      <span className={isSelected ? 'text-hud-cyan' : ''}>{ac.flightNumber}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({ac.tailNumber})</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{ac.airline}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">{ac.model}</div>
                    <div className="text-[10px] text-slate-500">SQWK {ac.squawk}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-200">
                      {ac.originIata} → {ac.destIata}
                    </div>
                    <div className="text-[10px] text-slate-400">{ac.origin.split(' ')[0]} to {ac.destination.split(' ')[0]}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div>FL{(ac.altitudeFt / 100).toFixed(0)} ({ac.altitudeFt.toLocaleString()} ft)</div>
                    <div className="text-[10px] text-slate-400">{ac.groundSpeedKnots} kts • HDG {ac.headingDeg.toFixed(0)}°</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-800 text-[10px] font-bold text-blue-300">
                      {ac.phase}
                    </span>
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
                      <span className={`font-bold ${
                        ac.overallHealthScore > 85 ? 'text-hud-emerald' : 'text-hud-amber'
                      }`}>
                        {ac.overallHealthScore}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ac.riskScore < 25 
                        ? 'bg-hud-emerald/10 text-hud-emerald' 
                        : ac.riskScore < 50 
                        ? 'bg-hud-amber/10 text-hud-amber' 
                        : 'bg-hud-crimson/20 text-hud-crimson animate-pulse'
                    }`}>
                      {ac.riskScore < 25 ? 'LOW (NOMINAL)' : ac.riskScore < 50 ? 'ELEVATED' : 'CRITICAL'}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAircraft(ac.aircraftId);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-aerospace-900 border border-hud-cyan/40 hover:bg-hud-cyan hover:text-black font-bold text-[10px] text-hud-cyan transition-all inline-flex items-center gap-1"
                    >
                      <span>TRACK</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
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
