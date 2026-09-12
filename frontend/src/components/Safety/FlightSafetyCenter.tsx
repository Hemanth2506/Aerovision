import React, { useState } from 'react';
import { AircraftTelemetry } from '../../types';
import { SafetyRiskMatrix } from './SafetyRiskMatrix';
import { FOQAExceedances } from './FOQAExceedances';
import { EmergencyChecklists } from './EmergencyChecklists';
import { ShieldAlert, Activity, BookOpen, AlertTriangle } from 'lucide-react';

interface FlightSafetyCenterProps {
  telemetry: AircraftTelemetry;
}

export const FlightSafetyCenter: React.FC<FlightSafetyCenterProps> = ({ telemetry }) => {
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'FOQA' | 'QRH'>('MATRIX');

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-hud-crimson/15 border border-hud-crimson/40 text-hud-crimson shadow-hud-glow-red">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                FLIGHT SAFETY INTELLIGENCE & SMS CENTER
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                ICAO Annex 19 Safety Management System • FOQA/FDM Flight Data Monitoring • QRH Emergency Checklists
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-aerospace-900/90 border border-slate-800 rounded-xl p-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('MATRIX')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'MATRIX'
                ? 'bg-hud-crimson/20 border border-hud-crimson/50 text-hud-crimson font-bold shadow-hud-glow-red'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ICAO 5×5 RISK MATRIX</span>
          </button>
          <button
            onClick={() => setActiveTab('FOQA')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'FOQA'
                ? 'bg-hud-crimson/20 border border-hud-crimson/50 text-hud-crimson font-bold shadow-hud-glow-red'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>FOQA EXCEEDANCES</span>
          </button>
          <button
            onClick={() => setActiveTab('QRH')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'QRH'
                ? 'bg-hud-crimson/20 border border-hud-crimson/50 text-hud-crimson font-bold shadow-hud-glow-red'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>QRH ABNORMAL CHECKLISTS</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <SafetyRiskMatrix telemetry={telemetry} />
      <FOQAExceedances />
      <EmergencyChecklists />
    </div>
  );
};
