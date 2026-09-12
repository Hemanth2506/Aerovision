import React from 'react';
import { AircraftTelemetry } from '../../types';
import { Box, Flame, Droplets, Zap, Wind, ShieldCheck, AlertTriangle } from 'lucide-react';

interface CockpitDigitalTwinProps {
  telemetry: AircraftTelemetry;
}

export const CockpitDigitalTwin: React.FC<CockpitDigitalTwinProps> = ({ telemetry }) => {
  const isEng2Fault = telemetry.engine2.egtDegC > 750 || telemetry.engine2.vibrationN2 > 1.0;
  const isHydFault = telemetry.hydraulics.systemBPressurePsi < 2600;

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Box className="w-5 h-5 text-hud-cyan" />
          <div>
            <h3 className="font-display font-bold text-base text-white">
              COCKPIT DIGITAL TWIN — SUBSYSTEM HEALTH STATUS
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Live Subsystem Diagnostics • Glowing Component State Matrix
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[10px]">AIRFRAME HEALTH:</span>
          <span className={`text-sm font-bold ${
            telemetry.overallHealthScore > 85 ? 'text-hud-emerald' : 'text-hud-amber'
          }`}>
            {telemetry.overallHealthScore}%
          </span>
        </div>
      </div>

      {/* Subsystem Component Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Engine 1 (Left Turbofan) */}
        <div className="p-3.5 rounded-xl bg-aerospace-900/80 border border-hud-emerald/40 space-y-2 shadow-hud-glow-green">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-hud-emerald font-bold">
              <Flame className="w-4 h-4" />
              <span>TURBOFAN #1 (PORT)</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-hud-emerald/20 text-hud-emerald font-bold">
              NOMINAL
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div>EGT: <b className="text-white">{telemetry.engine1.egtDegC}°C</b></div>
            <div>N1 RPM: <b className="text-white">{telemetry.engine1.n1Percent}%</b></div>
            <div>OIL PRESS: <b className="text-white">{telemetry.engine1.oilPressurePsi} PSI</b></div>
            <div>VIB N2: <b className="text-hud-emerald">{telemetry.engine1.vibrationN2} mm/s</b></div>
          </div>
        </div>

        {/* 2. Engine 2 (Right Turbofan - Threat Sensor) */}
        <div className={`p-3.5 rounded-xl border space-y-2 transition-all ${
          isEng2Fault 
            ? 'bg-hud-crimson/15 border-hud-crimson shadow-hud-glow-red' 
            : 'bg-aerospace-900/80 border-hud-emerald/40'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 font-bold ${isEng2Fault ? 'text-hud-crimson' : 'text-hud-emerald'}`}>
              <Flame className="w-4 h-4" />
              <span>TURBOFAN #2 (STARBOARD)</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
              isEng2Fault ? 'bg-hud-crimson text-white animate-pulse' : 'bg-hud-emerald/20 text-hud-emerald'
            }`}>
              {isEng2Fault ? 'EXCEEDANCE' : 'NOMINAL'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div>EGT: <b className={isEng2Fault ? 'text-hud-crimson font-bold' : 'text-white'}>{telemetry.engine2.egtDegC}°C</b></div>
            <div>N1 RPM: <b className="text-white">{telemetry.engine2.n1Percent}%</b></div>
            <div>OIL PRESS: <b className="text-white">{telemetry.engine2.oilPressurePsi} PSI</b></div>
            <div>VIB N2: <b className={isEng2Fault ? 'text-hud-crimson font-bold' : 'text-hud-emerald'}>{telemetry.engine2.vibrationN2} mm/s</b></div>
          </div>
        </div>

        {/* 3. Hydraulic Power System */}
        <div className={`p-3.5 rounded-xl border space-y-2 ${
          isHydFault 
            ? 'bg-hud-amber/15 border-hud-amber shadow-hud-glow-amber' 
            : 'bg-aerospace-900/80 border-hud-emerald/40'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Droplets className="w-4 h-4" />
              <span>HYDRAULIC POWER 3000 PSI</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-hud-emerald/20 text-hud-emerald font-bold">
              {isHydFault ? 'CIRCUIT B DELTA' : 'NOMINAL'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-300">
            <div>SYS A: <b className="text-white">{telemetry.hydraulics.systemAPressurePsi}</b></div>
            <div>SYS B: <b className={isHydFault ? 'text-hud-amber' : 'text-white'}>{telemetry.hydraulics.systemBPressurePsi}</b></div>
            <div>SYS C: <b className="text-white">{telemetry.hydraulics.systemCPressurePsi}</b></div>
          </div>
          <div className="text-[10px] text-slate-400">FLUID TEMP: {telemetry.hydraulics.fluidTempC}°C</div>
        </div>

        {/* 4. Fuel Distribution System */}
        <div className="p-3.5 rounded-xl bg-aerospace-900/80 border border-hud-emerald/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-hud-cyan font-bold">
              <Droplets className="w-4 h-4" />
              <span>FUEL TANKS & MANIFOLD</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-hud-emerald/20 text-hud-emerald font-bold">
              BALANCED
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div>TOTAL: <b className="text-white">{telemetry.fuel.totalQuantityKg.toLocaleString()} KG</b></div>
            <div>BURN RATE: <b className="text-hud-amber">{telemetry.fuel.fuelBurnRateTotalKgHr.toLocaleString()} kg/h</b></div>
          </div>
        </div>

        {/* 5. Electrical Power & Batteries */}
        <div className="p-3.5 rounded-xl bg-aerospace-900/80 border border-hud-emerald/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-400 font-bold">
              <Zap className="w-4 h-4" />
              <span>ELECTRICAL AC/DC BUS</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-hud-emerald/20 text-hud-emerald font-bold">
              115V AC
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div>VOLTAGE: <b className="text-white">{telemetry.avionics.electricalBusVoltageV} V</b></div>
            <div>BATTERY: <b className="text-hud-emerald">{telemetry.avionics.batteryChargePercent}%</b></div>
          </div>
        </div>

        {/* 6. Navigation & Air Data ADIRU */}
        <div className="p-3.5 rounded-xl bg-aerospace-900/80 border border-hud-emerald/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-hud-cyan font-bold">
              <Wind className="w-4 h-4" />
              <span>ADIRU AIR DATA & FLIGHT CONTROLS</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-hud-emerald/20 text-hud-emerald font-bold">
              TRIPLE SYNC
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div>CABIN ALT: <b className="text-white">{telemetry.avionics.cabinAltitudeFt} FT</b></div>
            <div>DIFF PRESS: <b className="text-white">{telemetry.avionics.differentialPressurePsi} PSI</b></div>
          </div>
        </div>
      </div>
    </div>
  );
};
