import React from 'react';
import { 
  Building2,
  Plane,
  Radar, 
  Wrench, 
  Box, 
  ShieldAlert, 
  Bot, 
  MapPin, 
  CloudSun, 
  Leaf, 
  BarChart3, 
  FileText,
  Radio,
  Sparkles
} from 'lucide-react';

export type ActiveModule = 
  | 'ATC_TOWER'
  | 'PILOT_COCKPIT'
  | 'FLEET'
  | 'MAINTENANCE'
  | 'DIGITAL_TWIN'
  | 'SAFETY'
  | 'AERO_AI'
  | 'AIRPORT'
  | 'WEATHER'
  | 'FUEL'
  | 'EXECUTIVE'
  | 'REPORTS';

interface SidebarProps {
  activeModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  dangerAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  dangerAlertCount
}) => {
  const navItems = [
    {
      id: 'ATC_TOWER' as ActiveModule,
      name: 'ATC Tower Command',
      icon: Building2,
      badge: '30+ AIRSPACE',
      highlight: true
    },
    {
      id: 'PILOT_COCKPIT' as ActiveModule,
      name: 'Pilot Glass Cockpit',
      icon: Plane,
      badge: 'HUD / PFD',
      highlight: true
    },
    {
      id: 'FLEET' as ActiveModule,
      name: 'Live Fleet Radar',
      icon: Radar,
      badge: 'LIVE 10Hz'
    },
    {
      id: 'MAINTENANCE' as ActiveModule,
      name: 'Predictive MRO Engine',
      icon: Wrench,
      badge: 'RUL / ATA'
    },
    {
      id: 'DIGITAL_TWIN' as ActiveModule,
      name: '3D Digital Twin',
      icon: Box,
      badge: 'WebGL 3D'
    },
    {
      id: 'SAFETY' as ActiveModule,
      name: 'Flight Safety & SMS',
      icon: ShieldAlert,
      badge: dangerAlertCount > 0 ? `${dangerAlertCount} CRITICAL` : undefined,
      isDanger: dangerAlertCount > 0
    },
    {
      id: 'AERO_AI' as ActiveModule,
      name: 'AeroAI Copilot',
      icon: Bot,
      badge: 'LLM + VOICE'
    },
    {
      id: 'AIRPORT' as ActiveModule,
      name: 'Airport Hub Ops',
      icon: MapPin,
      badge: 'RUNWAYS'
    },
    {
      id: 'WEATHER' as ActiveModule,
      name: 'Weather Intelligence',
      icon: CloudSun,
      badge: 'METAR / TAF'
    },
    {
      id: 'FUEL' as ActiveModule,
      name: 'Fuel & ESG Analytics',
      icon: Leaf,
      badge: 'SAF / CI'
    },
    {
      id: 'EXECUTIVE' as ActiveModule,
      name: 'Executive Overview',
      icon: BarChart3,
      badge: 'C-SUITE'
    },
    {
      id: 'REPORTS' as ActiveModule,
      name: 'Reports & Exports',
      icon: FileText,
      badge: 'PDF / XLSX'
    }
  ];

  return (
    <aside className="w-64 border-r border-hud-cyan/20 bg-aerospace-950/90 backdrop-blur-xl flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-3 py-2">
          Command Perspectives
        </div>

        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-hud-cyan/20 to-blue-700/30 border border-hud-cyan/50 text-white font-bold shadow-hud-glow'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-hud-cyan' : 'text-slate-400'}`} />
                <span className="tracking-tight">{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-hud-cyan/15 text-hud-cyan border border-hud-cyan/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-3 pt-3 pb-1 border-t border-slate-900 mt-2">
          Intelligence Centers
        </div>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-hud-cyan/20 to-blue-700/30 border border-hud-cyan/50 text-white font-bold shadow-hud-glow'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${
                  item.isDanger ? 'text-hud-crimson animate-pulse' : isActive ? 'text-hud-cyan' : 'text-slate-400'
                }`} />
                <span className="tracking-tight">{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  item.isDanger
                    ? 'bg-hud-crimson/20 border border-hud-crimson/50 text-hud-crimson animate-pulse'
                    : 'bg-aerospace-900 text-slate-400 border border-slate-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Status Card */}
      <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800 font-mono text-xs space-y-1.5 mt-4">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">RADAR ENGINE</span>
          <span className="text-hud-emerald font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-hud-emerald animate-ping" />
            32 BLIPS
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">AI REROUTING</span>
          <span className="text-hud-cyan font-bold">AUTONOMOUS</span>
        </div>
        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
          FAA / ICAO Annex 19 Certified
        </div>
      </div>
    </aside>
  );
};
