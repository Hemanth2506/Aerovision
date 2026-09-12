import React from 'react';
import { EnvironmentMetrics } from '../../types';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  Eye, 
  Gauge, 
  Activity, 
  AlertTriangle, 
  Thermometer, 
  CloudRain, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

interface EnvironmentPanelProps {
  environment: EnvironmentMetrics;
  flightNumber: string;
}

export const EnvironmentPanel: React.FC<EnvironmentPanelProps> = ({
  environment,
  flightNumber
}) => {
  const isSevere = environment.stormSeverity === 'SEVERE' || environment.stormSeverity === 'EXTREME';
  const isModerate = environment.stormSeverity === 'MODERATE';

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${
            isSevere 
              ? 'bg-hud-crimson/20 border-hud-crimson/40 text-hud-crimson animate-pulse' 
              : 'bg-sky-500/20 border-sky-500/40 text-sky-400'
          }`}>
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">
              LIVE WEATHER & FLIGHT ENVIRONMENT
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Real-time In-Situ Atmospheric Sensing • Radar Meteorological Telemetry
            </p>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
          isSevere
            ? 'bg-hud-crimson text-white animate-pulse shadow-hud-glow-red'
            : isModerate
            ? 'bg-hud-amber/20 text-hud-amber border border-hud-amber/40'
            : 'bg-hud-emerald/20 text-hud-emerald border border-hud-emerald/40'
        }`}>
          SEVERITY: {environment.stormSeverity}
        </span>
      </div>

      {/* Grid: 10 Atmospheric Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {/* 1. Temperature */}
        <div className="p-2.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>OAT / TEMP</span>
            <Thermometer className="w-3.5 h-3.5 text-hud-cyan" />
          </div>
          <div className="text-base font-bold text-white mt-1">{environment.temperatureC}°C</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Static Air Temp</div>
        </div>

        {/* 2. Wind Speed & Direction */}
        <div className="p-2.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>WIND VECTOR</span>
            <Wind className="w-3.5 h-3.5 text-hud-cyan" />
          </div>
          <div className="text-base font-bold text-hud-cyan mt-1">
            {environment.windDirectionDeg}° / {environment.windSpeedKnots} kt
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">Core Vector</div>
        </div>

        {/* 3. Turbulence Index EDR */}
        <div className={`p-2.5 rounded-xl border ${
          environment.turbulenceIndexEdr > 0.6 
            ? 'bg-hud-crimson/15 border-hud-crimson/40 text-hud-crimson' 
            : environment.turbulenceIndexEdr > 0.3 
            ? 'bg-hud-amber/10 border-hud-amber/40 text-hud-amber' 
            : 'bg-aerospace-900/80 border-slate-800 text-white'
        }`}>
          <div className="flex items-center justify-between text-[10px]">
            <span>TURBULENCE</span>
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="text-base font-bold mt-1">
            {environment.turbulenceIndexEdr.toFixed(2)} EDR
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            {environment.turbulenceIndexEdr > 0.6 ? 'Severe Chop' : environment.turbulenceIndexEdr > 0.3 ? 'Moderate' : 'Smooth'}
          </div>
        </div>

        {/* 4. Visibility */}
        <div className="p-2.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>VISIBILITY</span>
            <Eye className="w-3.5 h-3.5 text-hud-emerald" />
          </div>
          <div className="text-base font-bold text-hud-emerald mt-1">{environment.visibilityKm} km</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Flight Path Visual</div>
        </div>

        {/* 5. Air Pressure */}
        <div className="p-2.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>AIR PRESSURE</span>
            <Gauge className="w-3.5 h-3.5 text-hud-cyan" />
          </div>
          <div className="text-base font-bold text-white mt-1">{environment.airPressureHpa} hPa</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Ambient Static</div>
        </div>

        {/* 6. Humidity */}
        <div className="p-2.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>HUMIDITY</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-base font-bold text-white mt-1">{environment.humidityPercent}%</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Dewpoint Spread</div>
        </div>

        {/* 7. Rain Probability */}
        <div className="p-2.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>PRECIPITATION</span>
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-base font-bold text-sky-400 mt-1">{environment.rainProbabilityPercent}%</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Radar Reflectivity</div>
        </div>

        {/* 8. Cloud Density */}
        <div className="p-2.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>CLOUD COVER</span>
            <CloudSun className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div className="text-base font-bold text-white mt-1">{environment.cloudDensityPercent}%</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Overcast Layer</div>
        </div>

        {/* 9. Icing Risk */}
        <div className={`p-2.5 rounded-xl border ${
          environment.icingRisk === 'SEVERE'
            ? 'bg-hud-crimson/15 border-hud-crimson/40 text-hud-crimson'
            : environment.icingRisk === 'MEDIUM'
            ? 'bg-hud-amber/10 border-hud-amber/40 text-hud-amber'
            : 'bg-aerospace-900/80 border-slate-800 text-hud-emerald'
        }`}>
          <div className="flex items-center justify-between text-[10px]">
            <span>AIRFRAME ICING</span>
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="text-base font-bold mt-1">{environment.icingRisk}</div>
          <div className="text-[9px] text-slate-400 mt-0.5">Anti-Ice State</div>
        </div>

        {/* 10. Sensor Sync */}
        <div className="p-2.5 rounded-xl bg-aerospace-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>AVIONICS SYNC</span>
            <span className="w-2 h-2 rounded-full bg-hud-emerald animate-ping" />
          </div>
          <div className="text-xs font-bold text-hud-emerald mt-1">● 100% ONLINE</div>
          <div className="text-[9px] text-slate-500">ADIRU 1/2/3 Active</div>
        </div>
      </div>
    </div>
  );
};
