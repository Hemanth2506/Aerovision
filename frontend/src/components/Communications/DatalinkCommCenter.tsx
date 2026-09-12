import React, { useState } from 'react';
import { DatalinkMessage, AircraftTelemetry } from '../../types';
import { telemetryEngine } from '../../services/telemetryEngine';
import { 
  Radio, 
  Send, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Navigation, 
  Wrench, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

interface DatalinkCommCenterProps {
  messages: DatalinkMessage[];
  activeAircraft: AircraftTelemetry;
  mode: 'TOWER' | 'PILOT';
}

export const DatalinkCommCenter: React.FC<DatalinkCommCenterProps> = ({
  messages,
  activeAircraft,
  mode
}) => {
  const [customText, setCustomText] = useState<string>('');

  const handleSendQuickAction = (
    type: DatalinkMessage['type'],
    content: string
  ) => {
    telemetryEngine.sendDatalinkMessage(
      mode === 'PILOT' ? 'PILOT' : 'TOWER',
      activeAircraft.flightNumber,
      activeAircraft.aircraftId,
      type,
      content
    );
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    telemetryEngine.sendDatalinkMessage(
      mode === 'PILOT' ? 'PILOT' : 'TOWER',
      activeAircraft.flightNumber,
      activeAircraft.aircraftId,
      'ROUTE_CHANGE_REQUEST',
      customText
    );
    setCustomText('');
  };

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-hud-emerald/20 border border-hud-emerald/40 text-hud-emerald shadow-hud-glow-green">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">
              PILOT ↔ TOWER CPDLC / ACARS DATALINK NETWORK
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              FANS 1/A Controller-Pilot Data Link Communications • Bidirectional Real-Time Protocol
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-hud-emerald animate-ping" />
          <span>LINK 2000+ ENCRYPTED • {mode === 'PILOT' ? `COCKPIT (${activeAircraft.flightNumber})` : 'ATC SECTOR CONSOLE'}</span>
        </div>
      </div>

      {/* Quick Action Buttons for Pilot or Tower */}
      <div className="space-y-2">
        <div className="text-[10px] text-slate-500 uppercase font-bold">
          {mode === 'PILOT' ? 'PILOT QUICK CPDLC ACTIONS:' : 'ATC TOWER DIRECTIVES:'}
        </div>

        <div className="flex flex-wrap gap-2">
          {mode === 'PILOT' ? (
            <>
              <button
                onClick={() => handleSendQuickAction('ROUTE_CHANGE_REQUEST', `REQUEST DIRECT ROUTING TO AVOID SEVERE CONVECTIVE STORM CELL. READY TO COPY NEW WAYPOINTS.`)}
                className="px-3 py-1.5 rounded-lg bg-hud-emerald/20 border border-hud-emerald/40 hover:bg-hud-emerald/30 text-hud-emerald font-bold transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Request AI Storm Deviation</span>
              </button>

              <button
                onClick={() => handleSendQuickAction('EMERGENCY_MAYDAY', `MAYDAY MAYDAY: ENGINE 2 VIBRATION & HIGH EGT. SQUAWK 7700. REQUEST IMMEDIATE DIVERSION.`)}
                className="px-3 py-1.5 rounded-lg bg-hud-crimson/20 border border-hud-crimson/40 hover:bg-hud-crimson/30 text-hud-crimson font-bold transition-all flex items-center gap-1.5 animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Declare MAYDAY (Squawk 7700)</span>
              </button>

              <button
                onClick={() => handleSendQuickAction('LANDING_CLEARANCE_REQUEST', `REQUEST ILS RUNWAY CLEARANCE & DESCENT PROFILE FOR DESTINATION AIRPORT.`)}
                className="px-3 py-1.5 rounded-lg bg-hud-cyan/20 border border-hud-cyan/40 hover:bg-hud-cyan/30 text-hud-cyan font-bold transition-all"
              >
                Request Landing Clearance
              </button>

              <button
                onClick={() => handleSendQuickAction('TECHNICAL_ANOMALY_REPORT', `ACARS ENGINE HEALTH TELEMETRY DISPATCH: EGT MARGIN DECAY 8°C. REQUEST MRO LINE COORDINATION.`)}
                className="px-3 py-1.5 rounded-lg bg-aerospace-900 border border-slate-700 hover:border-hud-cyan text-slate-300 transition-all flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-hud-amber" />
                <span>Report EGT Anomaly to MRO</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleSendQuickAction('ROUTE_OPTIMIZED_CLEARANCE', `${activeAircraft.flightNumber}: CLEARED AI OPTIMIZED GREEN CORRIDOR VIA NEW WAYPOINTS FL390. REPORT CLEAR OF CONVECTION.`)}
                className="px-3 py-1.5 rounded-lg bg-hud-emerald/20 border border-hud-emerald/40 hover:bg-hud-emerald/30 text-hud-emerald font-bold transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authorize AI Green Reroute</span>
              </button>

              <button
                onClick={() => handleSendQuickAction('WEATHER_ALERT_BROADCAST', `ALL STATIONS: LEVEL 5 SUPERCELL ACTIVE OVER SECTOR. REROUTE MANDATORY FOR ALL INBOUND FLIGHTS.`)}
                className="px-3 py-1.5 rounded-lg bg-hud-crimson/20 border border-hud-crimson/40 hover:bg-hud-crimson/30 text-hud-crimson font-bold transition-all flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Broadcast Sector Storm Alert</span>
              </button>

              <button
                onClick={() => handleSendQuickAction('LANDING_CLEARANCE_ISSUED', `${activeAircraft.flightNumber}: CLEARED ILS APPROACH RUNWAY 04L. WIND 080 AT 14 KTS. CONTACT TOWER 119.1.`)}
                className="px-3 py-1.5 rounded-lg bg-hud-cyan/20 border border-hud-cyan/40 hover:bg-hud-cyan/30 text-hud-cyan font-bold transition-all"
              >
                Issue ILS Clearance
              </button>
            </>
          )}
        </div>
      </div>

      {/* Datalink Messages Feed */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {messages.map((msg) => {
          const isPilot = msg.sender === 'PILOT';
          const isAI = msg.sender === 'AI_SYSTEM';

          return (
            <div
              key={msg.id}
              className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                isAI
                  ? 'bg-purple-950/20 border-purple-800/40 text-purple-200'
                  : isPilot
                  ? 'bg-hud-cyan/10 border-hud-cyan/30 text-slate-200'
                  : 'bg-aerospace-900/80 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] border-b border-slate-800/60 pb-1">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${isAI ? 'text-purple-400' : isPilot ? 'text-hud-cyan' : 'text-hud-emerald'}`}>
                    [{msg.sender === 'PILOT' ? `COCKPIT (${msg.flightNumber})` : msg.sender === 'TOWER' ? 'ATC TOWER SECTOR' : 'AI INTELLIGENCE'}]
                  </span>
                  <span className="text-slate-500 font-mono">• {msg.type.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{msg.timestamp}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-hud-emerald font-bold">
                    {msg.status}
                  </span>
                </div>
              </div>

              <div className="font-mono text-slate-200">
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual CPDLC Message Sender */}
      <form onSubmit={handleSendCustom} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder={`Compose direct CPDLC datalink transmission to ${mode === 'PILOT' ? 'ATC Tower' : 'Cockpit'}...`}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className="flex-1 p-2.5 rounded-xl bg-aerospace-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-hud-cyan text-xs"
        />
        <button
          type="submit"
          disabled={!customText.trim()}
          className="px-4 py-2.5 rounded-xl bg-hud-cyan hover:bg-hud-cyan/90 text-black font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>TRANSMIT</span>
        </button>
      </form>
    </div>
  );
};
