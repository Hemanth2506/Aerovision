import React, { useState } from 'react';
import { AIRPORT_HUBS } from '../../data/mockData';
import { AirportTurnaround } from '../../types';
import { Building2, Navigation, AlertTriangle, CheckCircle, Clock, Plane, ShieldAlert } from 'lucide-react';
import { telemetryEngine } from '../../services/telemetryEngine';

export const AirportQueueManager: React.FC = () => {
  const [selectedHub, setSelectedHub] = useState<string>('KJFK');

  const activeAirport: AirportTurnaround = AIRPORT_HUBS.find(h => h.airportCode === selectedHub) || AIRPORT_HUBS[0];

  const handleIssueClearance = (flightNumber: string, runway: string) => {
    telemetryEngine.sendDatalinkMessage(
      'TOWER',
      flightNumber,
      'AC-AUTO',
      'LANDING_CLEARANCE_ISSUED',
      `ATC CLEARANCE: ${flightNumber} CLEARED ILS APPROACH ${runway}. WIND 080 AT 14 KTS. MAINTAIN 160 KTS TO 4 MILE FINAL.`
    );
  };

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4 font-mono text-xs select-none">
      {/* Header & Airport Hub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-display font-bold text-base text-white">
              ATC AIRFIELD OPERATIONS & RUNWAY SEQUENCER
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Live Arrival Queue Sequencing • Runway Flow Management & Emergency Landing Priority
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-aerospace-900/90 border border-slate-800 rounded-xl p-1">
          {AIRPORT_HUBS.map(hub => (
            <button
              key={hub.airportCode}
              onClick={() => setSelectedHub(hub.airportCode)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                hub.airportCode === selectedHub
                  ? 'bg-blue-600/30 border border-blue-500 text-hud-cyan font-bold shadow-hud-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {hub.airportCode}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Runway Utilization & Arrival Sequence Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Runways Panel */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            ACTIVE RUNWAYS ({activeAirport.airportCode}):
          </div>
          {activeAirport.runways.map((rwy, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-aerospace-900/70 border border-slate-800 space-y-2"
            >
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
              <div className="text-[10px] text-slate-500">
                ASSIGNED INBOUNDS: <b className="text-hud-cyan">{rwy.assignedArrivals?.join(', ') || 'AV-250, DL-412'}</b>
              </div>
            </div>
          ))}
        </div>

        {/* Inbound Landing Queue */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            INBOUND LANDING SEQUENCE & PRIORITY QUEUE:
          </div>

          <div className="space-y-2.5">
            {activeAirport.landingQueue && activeAirport.landingQueue.length > 0 ? (
              activeAirport.landingQueue.map((item, idx) => {
                const isEmergency = item.priorityLevel === 'EMERGENCY';

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      isEmergency
                        ? 'bg-hud-crimson/20 border-hud-crimson shadow-hud-glow-red'
                        : 'bg-aerospace-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-500 text-sm">#{idx + 1}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{item.flightNumber}</span>
                          <span className="text-slate-400 text-[10px]">({item.aircraftModel})</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isEmergency ? 'bg-hud-crimson text-white animate-pulse' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {item.priorityLevel}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          ETA: <b className="text-hud-cyan">{item.etaMinutes} Mins</b> • ASSIGNED: <b className="text-white">{item.assignedRunway}</b> • STATUS: <span className="text-hud-emerald font-bold">{item.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleIssueClearance(item.flightNumber, item.assignedRunway)}
                      className="px-3 py-1.5 rounded-lg bg-hud-cyan hover:bg-hud-cyan/90 text-black font-bold text-[11px] transition-all shadow-hud-glow"
                    >
                      Issue ILS Clearance →
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-xl bg-aerospace-900/60 border border-slate-800 text-slate-400 text-center">
                All scheduled inbound traffic currently on final approach.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
