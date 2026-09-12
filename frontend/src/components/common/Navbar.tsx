import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Radio, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Building2,
  Sparkles
} from 'lucide-react';
import { UserPersona, AircraftTelemetry, OperationalAlert, ViewPerspective } from '../../types';
import { USER_PERSONAS } from '../../data/mockData';
import { audioService } from '../../services/audioService';
import { telemetryEngine, SimulationSpeed } from '../../services/telemetryEngine';

interface NavbarProps {
  perspective: ViewPerspective;
  onSelectPerspective: (perspective: ViewPerspective) => void;
  currentPersona: UserPersona;
  onSelectPersona: (persona: UserPersona) => void;
  activeAircraft: AircraftTelemetry;
  fleet: AircraftTelemetry[];
  onSelectAircraft: (aircraftId: string) => void;
  alerts: OperationalAlert[];
}

export const Navbar: React.FC<NavbarProps> = ({
  perspective,
  onSelectPerspective,
  currentPersona,
  onSelectPersona,
  activeAircraft,
  fleet,
  onSelectAircraft,
  alerts
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [speed, setSpeed] = useState<SimulationSpeed>(1);
  const [isPersonaOpen, setIsPersonaOpen] = useState<boolean>(false);
  const [isAircraftOpen, setIsAircraftOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istTimeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const istDateStr = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      setUtcTime(`${istDateStr} • ${istTimeStr} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioService.setMuted(next);
  };

  const handleSpeedChange = (newSpeed: SimulationSpeed) => {
    setSpeed(newSpeed);
    telemetryEngine.setSpeed(newSpeed);
  };

  const dangerCount = fleet.filter(a => a.safetyStatus === 'DANGER').length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <header className="h-16 border-b border-hud-cyan/20 bg-aerospace-950/95 backdrop-blur-xl px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Monitored Flight */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-hud-cyan/20 to-blue-600/30 border border-hud-cyan/40 flex items-center justify-center shadow-hud-glow">
            <Plane className="w-6 h-6 text-hud-cyan transform -rotate-45" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-hud-emerald animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-hud-emerald" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-wider text-white">AERO<span className="text-hud-cyan">VISION</span></span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-hud-cyan/10 border border-hud-cyan/30 text-hud-cyan font-mono font-bold tracking-wider">v2.5 PRO</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-hud-emerald animate-pulse"></span>
              {perspective === 'ATC_TOWER' ? 'AIR TRAFFIC CONTROL TOWER' : 'PILOT GLASS COCKPIT'}
            </p>
          </div>
        </div>

        {/* DUAL PERSPECTIVE SWITCHER (ATC TOWER vs PILOT COCKPIT) */}
        <div className="flex items-center gap-1 bg-aerospace-900 border border-hud-cyan/40 rounded-xl p-1 font-mono text-xs shadow-hud-glow">
          <button
            onClick={() => onSelectPerspective('ATC_TOWER')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              perspective === 'ATC_TOWER'
                ? 'bg-gradient-to-r from-hud-cyan/30 to-blue-700/40 border border-hud-cyan text-white font-bold shadow-hud-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-hud-cyan" />
            <span>ATC TOWER</span>
          </button>

          <button
            onClick={() => onSelectPerspective('PILOT_COCKPIT')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              perspective === 'PILOT_COCKPIT'
                ? 'bg-gradient-to-r from-hud-emerald/30 to-emerald-700/40 border border-hud-emerald text-white font-bold shadow-hud-glow-green'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-hud-emerald transform -rotate-45" />
            <span>PILOT COCKPIT</span>
          </button>
        </div>

        {/* Active Aircraft Dropdown Selector */}
        <div className="relative">
          <button 
            onClick={() => { setIsAircraftOpen(!isAircraftOpen); setIsPersonaOpen(false); }}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-aerospace-900 border border-slate-700 hover:border-hud-cyan text-left transition-all"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${
              activeAircraft.safetyStatus === 'DANGER' ? 'bg-hud-crimson animate-pulse' : activeAircraft.safetyStatus === 'CAUTION' ? 'bg-hud-amber' : 'bg-hud-emerald'
            }`} />
            <div>
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-hud-cyan">
                <span>{activeAircraft.flightNumber}</span>
                <span className="text-slate-400">({activeAircraft.originIata} → {activeAircraft.destIata})</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{activeAircraft.model} • {activeAircraft.tailNumber}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>

          {isAircraftOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-aerospace-900/98 border border-hud-cyan/40 rounded-xl shadow-2xl backdrop-blur-xl z-50 p-2 max-h-80 overflow-y-auto">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 py-1 border-b border-slate-800 flex justify-between">
                <span>32+ Airspace Aircraft</span>
                <span>Status</span>
              </div>
              {fleet.map(ac => (
                <button
                  key={ac.aircraftId}
                  onClick={() => {
                    onSelectAircraft(ac.aircraftId);
                    setIsAircraftOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between text-xs transition-colors my-1 ${
                    ac.aircraftId === activeAircraft.aircraftId
                      ? 'bg-hud-cyan/15 border border-hud-cyan/50 text-hud-cyan font-bold'
                      : 'hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-mono font-bold flex items-center gap-1.5">
                      <span>{ac.flightNumber}</span>
                      <span className="text-slate-400 font-normal">({ac.originIata} → {ac.destIata})</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{ac.model}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      ac.safetyStatus === 'DANGER'
                        ? 'bg-hud-crimson text-white animate-pulse'
                        : ac.safetyStatus === 'CAUTION'
                        ? 'bg-hud-amber/20 text-hud-amber'
                        : 'bg-hud-emerald/20 text-hud-emerald'
                    }`}>
                      {ac.safetyStatus}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Realtime Telemetry Simulation Controller & UTC Clock */}
      <div className="hidden xl:flex items-center gap-4">
        {/* Live IST Clock */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-aerospace-900/80 border border-slate-800 font-mono text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-hud-cyan animate-pulse" />
          <span className="text-white font-bold">{utcTime || 'LIVE IST'}</span>
        </div>

        {/* Master Alert Indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs border ${
          dangerCount > 0 
            ? 'bg-hud-crimson/15 border-hud-crimson/50 text-hud-crimson animate-pulse shadow-hud-glow-red'
            : 'bg-hud-emerald/10 border-hud-emerald/30 text-hud-emerald'
        }`}>
          {dangerCount > 0 ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{dangerCount} DANGER AIRSPACE THREATS</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>AIRSPACE NORMAL</span>
            </>
          )}
        </div>

        {/* Sim Speed Controller */}
        <div className="flex items-center gap-1 bg-aerospace-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => handleSpeedChange(speed === 0 ? 1 : 0)}
            title={speed === 0 ? 'Resume Telemetry Stream' : 'Pause Telemetry Stream'}
            className={`p-1.5 rounded text-xs transition-colors ${
              speed === 0 ? 'bg-hud-amber/20 text-hud-amber' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            {speed === 0 ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          {[1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s as SimulationSpeed)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                speed === s ? 'bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Right: Audio Toggle, ACARS, and Role Selector */}
      <div className="flex items-center gap-3">
        {/* Audio Alert Toggle */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute Aviation Sound Effects' : 'Mute Aviation Sound Effects'}
          className={`p-2 rounded-lg border transition-colors ${
            isMuted 
              ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300' 
              : 'bg-hud-cyan/10 border-hud-cyan/30 text-hud-cyan hover:bg-hud-cyan/20 shadow-hud-glow'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* ACARS Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-aerospace-900 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Radio className="w-3.5 h-3.5 text-hud-emerald animate-pulse" />
          <span className="text-slate-400">CPDLC:</span>
          <span className="text-hud-emerald font-bold">LINK 2000+</span>
        </div>

        {/* Persona / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => { setIsPersonaOpen(!isPersonaOpen); setIsAircraftOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-aerospace-900 to-aerospace-800 border border-hud-cyan/40 hover:border-hud-cyan text-left shadow-hud-glow transition-all"
          >
            <span className="text-lg">{currentPersona.avatar}</span>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>{currentPersona.displayName}</span>
              </div>
              <div className="text-[10px] text-hud-cyan font-mono">{currentPersona.badge}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </button>

          {isPersonaOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-aerospace-900/95 border border-hud-cyan/30 rounded-xl shadow-2xl backdrop-blur-xl z-50 p-2">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
                <span>Switch Operator Role</span>
                <UserCheck className="w-3 h-3 text-hud-cyan" />
              </div>
              {USER_PERSONAS.map(p => (
                <button
                  key={p.role}
                  onClick={() => {
                    onSelectPersona(p);
                    setIsPersonaOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition-colors my-1 ${
                    p.role === currentPersona.role
                      ? 'bg-hud-cyan/15 border border-hud-cyan/50 text-white'
                      : 'hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <span className="text-2xl">{p.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold">{p.displayName}</div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-hud-cyan/10 border border-hud-cyan/30 text-hud-cyan font-mono font-bold">
                        {p.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{p.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-tight">{p.primaryFocus}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
