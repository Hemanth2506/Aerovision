import React, { useState } from 'react';
import { AIRPORT_HUBS } from '../../data/mockData';
import { AirportTurnaround } from '../../types';
import { Building2, Plane, Clock, Navigation, AlertCircle, CheckCircle, Gauge, ArrowRight } from 'lucide-react';

export const AirportOperationsCenter: React.FC = () => {
  const [selectedAirportCode, setSelectedAirportCode] = useState<string>('KJFK');

  const activeHub: AirportTurnaround = AIRPORT_HUBS.find(h => h.airportCode === selectedAirportCode) || AIRPORT_HUBS[0];

  const getStageColor = (status: string) => {
    switch (status) {
      case 'PUSHBACK_READY': return 'bg-hud-emerald text-black';
      case 'BOARDING': return 'bg-hud-cyan text-black';
      case 'REFUELING': return 'bg-hud-amber text-black';
      default: return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Airport Hub Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 shadow-hud-glow">
              <Building2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                AIRPORT OPERATIONS & GATE TURNAROUND HUB
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Runway Capacity • Gate Turnaround Gantt Milestones • Slot Congestion & Ground Radar Flow
              </p>
            </div>
          </div>
        </div>

        {/* Airport Hub Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-aerospace-900/90 border border-slate-800 rounded-xl p-1 font-mono text-xs">
          {AIRPORT_HUBS.map(hub => (
            <button
              key={hub.airportCode}
              onClick={() => setSelectedAirportCode(hub.airportCode)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                hub.airportCode === selectedAirportCode
                  ? 'bg-blue-600/30 border border-blue-500 text-hud-cyan font-bold shadow-hud-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {hub.airportCode} ({hub.airportName.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Airport Key KPIs Banner */}
      <div className="p-4 rounded-2xl glass-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">CONGESTION INDEX</div>
          <div className="text-2xl font-bold text-hud-cyan mt-1">{activeHub.congestionIndex} / 100</div>
          <div className="text-[10px] text-slate-500 mt-1">FLOW: {activeHub.congestionIndex < 50 ? 'NOMINAL' : 'MODERATE DELAYS'}</div>
        </div>

        <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">AVG TAXI-OUT TIME</div>
          <div className="text-2xl font-bold text-hud-emerald mt-1">{activeHub.averageTaxiOutMinutes} Mins</div>
          <div className="text-[10px] text-slate-500 mt-1">Target benchmark &lt;20 mins</div>
        </div>

        <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">FLIGHT CATEGORY</div>
          <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <span>{activeHub.flightCategory}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-hud-emerald/20 text-hud-emerald border border-hud-emerald/40">
              CEILING &gt; 3,000 FT
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Visual Flight Rules Valid</div>
        </div>

        <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">ACTIVE GATES MONITORED</div>
          <div className="text-2xl font-bold text-white mt-1">{activeHub.activeGates.length} Aircraft</div>
          <div className="text-[10px] text-hud-cyan mt-1">Live Turnaround Milestones</div>
        </div>
      </div>

      {/* METAR Raw Ticker */}
      <div className="p-3 rounded-xl bg-aerospace-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-[10px] font-bold text-hud-cyan bg-hud-cyan/10 px-2 py-0.5 rounded border border-hud-cyan/30">
            METAR RAW
          </span>
          <span className="text-slate-200">{activeHub.metarRaw}</span>
        </div>
      </div>

      {/* Runways Utilization */}
      <div className="p-4 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
          <h3 className="font-display font-bold text-base text-white">
            ACTIVE RUNWAY CAPACITY & SURFACE UTILIZATION
          </h3>
          <span className="text-xs text-slate-400">{activeHub.airportCode} AIRFIELD OPS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeHub.runways.map((rwy, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-aerospace-900/70 border border-slate-800 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{rwy.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  rwy.status === 'ACTIVE' ? 'bg-hud-emerald/20 text-hud-emerald' : 'bg-hud-amber/20 text-hud-amber'
                }`}>
                  {rwy.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                WIND: <b className="text-slate-200">{rwy.windComponentKnots}</b>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>UTILIZATION</span>
                  <span className="text-hud-cyan font-bold">{rwy.utilizationPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-hud-cyan rounded-full"
                    style={{ width: `${rwy.utilizationPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gate Turnaround Gantt Tracker */}
      <div className="p-4 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-mono">
          <h3 className="font-display font-bold text-base text-white">
            GATE TURNAROUND MILESTONES (GROUND SUPPORT EQUIPMENT)
          </h3>
          <span className="text-xs text-slate-400">DISPATCH CONTROL</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {activeHub.activeGates.map((gate, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-aerospace-900/80 border border-slate-800 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-hud-cyan text-sm">{gate.gate}</span>
                  <span className="text-white font-bold">{gate.flightNumber}</span>
                  <span className="text-slate-400">({gate.aircraftType})</span>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${getStageColor(gate.status)}`}>
                    {gate.status.replace('_', ' ')}
                  </span>
                  <span className="text-slate-400">
                    TARGET DEP: <b className="text-white">{gate.targetDepartureTime}</b>
                  </span>
                  {gate.delayMinutes > 0 && (
                    <span className="text-hud-amber font-bold">
                      +{gate.delayMinutes}m DELAY
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Milestones */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                  <span className="text-hud-emerald font-bold">Progress: {gate.progressPercent}% Completed</span>
                  <span>Turnaround Window (45 Mins Standard)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-hud-cyan to-hud-emerald rounded-full transition-all duration-300"
                    style={{ width: `${gate.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Turnaround Sub-stages checklist indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-[10px] text-center text-slate-400">
                <div className={`p-1.5 rounded border ${gate.progressPercent >= 20 ? 'bg-hud-emerald/10 border-hud-emerald/30 text-hud-emerald font-bold' : 'border-slate-800'}`}>
                  1. Deplaning
                </div>
                <div className={`p-1.5 rounded border ${gate.progressPercent >= 40 ? 'bg-hud-emerald/10 border-hud-emerald/30 text-hud-emerald font-bold' : 'border-slate-800'}`}>
                  2. Refueling
                </div>
                <div className={`p-1.5 rounded border ${gate.progressPercent >= 60 ? 'bg-hud-emerald/10 border-hud-emerald/30 text-hud-emerald font-bold' : 'border-slate-800'}`}>
                  3. Catering
                </div>
                <div className={`p-1.5 rounded border ${gate.progressPercent >= 75 ? 'bg-hud-emerald/10 border-hud-emerald/30 text-hud-emerald font-bold' : 'border-slate-800'}`}>
                  4. Baggage
                </div>
                <div className={`p-1.5 rounded border ${gate.progressPercent >= 90 ? 'bg-hud-emerald/10 border-hud-emerald/30 text-hud-emerald font-bold' : 'border-slate-800'}`}>
                  5. Boarding
                </div>
                <div className={`p-1.5 rounded border ${gate.progressPercent >= 95 ? 'bg-hud-emerald/10 border-hud-emerald/30 text-hud-emerald font-bold' : 'border-slate-800'}`}>
                  6. Pushback
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
