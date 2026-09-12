import React, { useState } from 'react';
import { AircraftTelemetry, OperationalAlert } from '../../types';
import { FleetRadarMap } from './FleetRadarMap';
import { LiveTelemetryPanel } from './LiveTelemetryPanel';
import { FleetRoster } from './FleetRoster';
import { Radar, Activity, ListOrdered, ShieldAlert, Sparkles } from 'lucide-react';

interface LiveFleetMonitoringProps {
  fleet: AircraftTelemetry[];
  activeAircraft: AircraftTelemetry;
  onSelectAircraft: (aircraftId: string) => void;
  alerts: OperationalAlert[];
}

export const LiveFleetMonitoring: React.FC<LiveFleetMonitoringProps> = ({
  fleet,
  activeAircraft,
  onSelectAircraft,
  alerts
}) => {
  const [activeSubView, setActiveSubView] = useState<'RADAR' | 'TELEMETRY' | 'ROSTER'>('RADAR');

  return (
    <div className="space-y-5">
      {/* Module Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-hud-cyan/15 border border-hud-cyan/40 text-hud-cyan shadow-hud-glow">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                LIVE FLEET MONITORING & RADAR TRACKING
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Real-time ADS-B ADS-C Oceanic Tracking • Continuous Engine Health Monitoring (EHM) • ACARS Telemetry
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-aerospace-900/90 border border-slate-800 rounded-xl p-1 font-mono text-xs">
          <button
            onClick={() => setActiveSubView('RADAR')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeSubView === 'RADAR'
                ? 'bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan font-bold shadow-hud-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>GLOBAL RADAR MAP</span>
          </button>
          <button
            onClick={() => setActiveSubView('TELEMETRY')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeSubView === 'TELEMETRY'
                ? 'bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan font-bold shadow-hud-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>LIVE TELEMETRY GAUGES</span>
          </button>
          <button
            onClick={() => setActiveSubView('ROSTER')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeSubView === 'ROSTER'
                ? 'bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan font-bold shadow-hud-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>FLEET ROSTER ({fleet.length})</span>
          </button>
        </div>
      </div>

      {/* Main View Container */}
      {activeSubView === 'RADAR' && (
        <div className="space-y-4">
          <FleetRadarMap
            fleet={fleet}
            activeAircraft={activeAircraft}
            onSelectAircraft={onSelectAircraft}
          />
          <LiveTelemetryPanel telemetry={activeAircraft} />
        </div>
      )}

      {activeSubView === 'TELEMETRY' && (
        <div className="space-y-4">
          <LiveTelemetryPanel telemetry={activeAircraft} />
          <FleetRoster
            fleet={fleet}
            activeAircraftId={activeAircraft.aircraftId}
            onSelectAircraft={onSelectAircraft}
          />
        </div>
      )}

      {activeSubView === 'ROSTER' && (
        <div className="space-y-4">
          <FleetRoster
            fleet={fleet}
            activeAircraftId={activeAircraft.aircraftId}
            onSelectAircraft={onSelectAircraft}
          />
          <LiveTelemetryPanel telemetry={activeAircraft} />
        </div>
      )}
    </div>
  );
};
