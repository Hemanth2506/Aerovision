import React, { useState } from 'react';
import { AircraftTelemetry, OperationalAlert, DatalinkMessage } from '../../types';
import { AirspaceRadarMap } from './AirspaceRadarMap';
import { FleetHealthComparison } from './FleetHealthComparison';
import { AirportQueueManager } from './AirportQueueManager';
import { DatalinkCommCenter } from '../Communications/DatalinkCommCenter';
import { RerouteIntelligenceModal } from '../AIReroute/RerouteIntelligenceModal';
import { 
  Radar, 
  Layers, 
  Box, 
  Building2, 
  Radio, 
  ShieldAlert, 
  Flame, 
  CheckCircle2, 
  Sparkles,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface ATCTowerViewProps {
  fleet: AircraftTelemetry[];
  activeAircraft: AircraftTelemetry;
  onSelectAircraft: (aircraftId: string) => void;
  alerts: OperationalAlert[];
  datalinkMessages: DatalinkMessage[];
}

export const ATCTowerView: React.FC<ATCTowerViewProps> = ({
  fleet,
  activeAircraft,
  onSelectAircraft,
  alerts,
  datalinkMessages
}) => {
  const [activeTab, setActiveTab] = useState<'RADAR' | 'FLEET_TWINS' | 'AIRPORT_QUEUES' | 'CPDLC'>('RADAR');
  const [rerouteTarget, setRerouteTarget] = useState<AircraftTelemetry | null>(null);

  const dangerFleet = fleet.filter(a => a.safetyStatus === 'DANGER');
  const reroutedFleet = fleet.filter(a => a.isRerouted);

  return (
    <div className="space-y-5 font-mono text-xs select-none">
      {/* ATC Tower Command Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-hud-cyan/20 to-blue-700/30 border border-hud-cyan/40 text-hud-cyan shadow-hud-glow">
              <Radar className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-bold text-white tracking-wide">
                  AIR TRAFFIC CONTROL TOWER & AIRSPACE SECTOR COMMAND
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-hud-cyan/20 border border-hud-cyan/40 text-hud-cyan font-bold">
                  SECTOR 41-ALPHA (32+ ACTIVE BLIPS)
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Central Aviation Command Ecosystem • Waypoint Navigation • Trajectory Hazard Detection • AI Autonomous Re-steering
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-aerospace-900/90 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('RADAR')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'RADAR'
                ? 'bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan font-bold shadow-hud-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radar className="w-4 h-4" />
            <span>GLOBAL AIRSPACE RADAR</span>
          </button>

          <button
            onClick={() => setActiveTab('FLEET_TWINS')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'FLEET_TWINS'
                ? 'bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan font-bold shadow-hud-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>FLEET DIGITAL TWINS</span>
          </button>

          <button
            onClick={() => setActiveTab('AIRPORT_QUEUES')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'AIRPORT_QUEUES'
                ? 'bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan font-bold shadow-hud-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>RUNWAY SEQUENCER</span>
          </button>

          <button
            onClick={() => setActiveTab('CPDLC')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'CPDLC'
                ? 'bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan font-bold shadow-hud-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>CPDLC DATALINK ({datalinkMessages.length})</span>
          </button>
        </div>
      </div>

      {/* REROUTE SECTOR NOTIFICATION BANNER */}
      {reroutedFleet.length > 0 && (
        <div className="p-3.5 rounded-xl bg-hud-emerald/15 border border-hud-emerald/50 text-white flex flex-wrap items-center justify-between gap-3 shadow-hud-glow-green">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-hud-emerald shrink-0" />
            <div>
              <div className="font-bold text-hud-emerald text-sm">
                AUTONOMOUS AI TRAJECTORY UPDATE: {reroutedFleet[0].flightNumber} REROUTED DUE TO SEVERE WEATHER
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                New flight plan approved • Waypoint coordinates updated • Estimated delay impact: <b className="text-white">+4.2 min</b> • Fuel impact: <b className="text-white">+240 kg</b>
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-hud-emerald text-black font-bold">
            PHYSICAL RE-STEERING ACTIVE
          </span>
        </div>
      )}

      {/* DANGER SECTOR CALLOUT (if un-rerouted danger exists) */}
      {dangerFleet.length > 0 && !dangerFleet[0].isRerouted && (
        <div className="p-3.5 rounded-xl bg-hud-crimson/20 border border-hud-crimson text-white flex flex-wrap items-center justify-between gap-3 shadow-hud-glow-red animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-hud-crimson shrink-0" />
            <div>
              <div className="font-bold text-hud-crimson text-sm">
                TRAJECTORY HAZARD WARNING: {dangerFleet[0].flightNumber} INTERSECTS CONVECTIVE SUPERCELL (TOPS FL480)
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Imminent threat to active flight plan. Execute autonomous AI rerouting to bypass danger zone.
              </div>
            </div>
          </div>
          <button
            onClick={() => setRerouteTarget(dangerFleet[0])}
            className="px-4 py-1.5 rounded-lg bg-hud-emerald hover:bg-hud-emerald/90 text-black font-bold text-xs flex items-center gap-1.5 shadow-hud-glow-green"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AUTHORIZE & RE-STEER →</span>
          </button>
        </div>
      )}

      {/* Main ATC Content Layout */}
      {activeTab === 'RADAR' && (
        <div className="space-y-4">
          <AirspaceRadarMap
            fleet={fleet}
            activeAircraft={activeAircraft}
            onSelectAircraft={onSelectAircraft}
            onTriggerRerouteModal={(ac) => setRerouteTarget(ac)}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <FleetHealthComparison
                fleet={fleet}
                activeAircraftId={activeAircraft.aircraftId}
                onSelectAircraft={onSelectAircraft}
                onOpenReroute={(ac) => setRerouteTarget(ac)}
              />
            </div>
            <div className="lg:col-span-6">
              <DatalinkCommCenter
                messages={datalinkMessages}
                activeAircraft={activeAircraft}
                mode="TOWER"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'FLEET_TWINS' && (
        <div className="space-y-4">
          <FleetHealthComparison
            fleet={fleet}
            activeAircraftId={activeAircraft.aircraftId}
            onSelectAircraft={onSelectAircraft}
            onOpenReroute={(ac) => setRerouteTarget(ac)}
          />
          <AirspaceRadarMap
            fleet={fleet}
            activeAircraft={activeAircraft}
            onSelectAircraft={onSelectAircraft}
            onTriggerRerouteModal={(ac) => setRerouteTarget(ac)}
          />
        </div>
      )}

      {activeTab === 'AIRPORT_QUEUES' && (
        <div className="space-y-4">
          <AirportQueueManager />
          <AirspaceRadarMap
            fleet={fleet}
            activeAircraft={activeAircraft}
            onSelectAircraft={onSelectAircraft}
            onTriggerRerouteModal={(ac) => setRerouteTarget(ac)}
          />
        </div>
      )}

      {activeTab === 'CPDLC' && (
        <div className="space-y-4">
          <DatalinkCommCenter
            messages={datalinkMessages}
            activeAircraft={activeAircraft}
            mode="TOWER"
          />
          <AirspaceRadarMap
            fleet={fleet}
            activeAircraft={activeAircraft}
            onSelectAircraft={onSelectAircraft}
            onTriggerRerouteModal={(ac) => setRerouteTarget(ac)}
          />
        </div>
      )}

      {/* Triggerable AI Route Optimization Modal */}
      {rerouteTarget && (
        <RerouteIntelligenceModal
          aircraft={rerouteTarget}
          onClose={() => setRerouteTarget(null)}
        />
      )}
    </div>
  );
};
