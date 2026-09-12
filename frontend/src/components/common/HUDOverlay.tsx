import React from 'react';
import { AircraftTelemetry } from '../../types';

interface HUDOverlayProps {
  telemetry: AircraftTelemetry;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({ telemetry }) => {
  const pitch = telemetry.flightControls.elevatorDeflectionDeg * 2.5; // Estimated pitch angle
  const roll = telemetry.flightControls.aileronDeflectionDeg * 3.5; // Estimated bank angle
  const speed = telemetry.groundSpeedKnots;
  const alt = telemetry.altitudeFt;
  const heading = telemetry.headingDeg;

  return (
    <div className="relative w-full h-64 rounded-2xl bg-aerospace-950/80 border border-hud-cyan/30 overflow-hidden font-mono select-none flex items-center justify-center shadow-hud-glow">
      {/* Background Radar Grid & Scanlines */}
      <div className="absolute inset-0 radar-grid opacity-30 pointer-events-none" />

      {/* Artificial Horizon Pitch / Roll Box */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Pitch / Roll rotating container */}
        <div 
          className="absolute w-full h-full flex items-center justify-center transition-transform duration-200"
          style={{ transform: `rotate(${-roll}deg)` }}
        >
          {/* Horizon Line */}
          <div className="w-40 h-[1.5px] bg-hud-cyan/80 shadow-hud-glow relative">
            <div className="absolute -left-3 top-0 w-3 h-[1.5px] bg-hud-cyan" />
            <div className="absolute -right-3 top-0 w-3 h-[1.5px] bg-hud-cyan" />
          </div>

          {/* Pitch Ladder Bars */}
          <div 
            className="absolute flex flex-col items-center gap-4 transition-transform duration-200"
            style={{ transform: `translateY(${pitch * 2}px)` }}
          >
            {/* +10 deg pitch */}
            <div className="w-16 h-0.5 bg-hud-cyan/60 flex justify-between px-1 text-[8px] text-hud-cyan">
              <span>10</span>
              <span>10</span>
            </div>
            {/* +5 deg pitch */}
            <div className="w-10 h-0.5 bg-hud-cyan/40" />
            <div className="w-20 h-0 opacity-0" />
            {/* -5 deg pitch */}
            <div className="w-10 h-0.5 bg-hud-amber/40" />
            {/* -10 deg pitch */}
            <div className="w-16 h-0.5 bg-hud-amber/60 flex justify-between px-1 text-[8px] text-hud-amber">
              <span>-10</span>
              <span>-10</span>
            </div>
          </div>
        </div>

        {/* Fixed Aircraft Symbol Crosshair */}
        <div className="absolute z-10 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 rounded-full border border-hud-cyan bg-hud-cyan/20" />
          <div className="w-8 h-[2px] bg-hud-cyan absolute -left-8" />
          <div className="w-8 h-[2px] bg-hud-cyan absolute -right-8" />
          <div className="w-[2px] h-3 bg-hud-cyan absolute -top-3" />
        </div>
      </div>

      {/* Airspeed Tape (Left) */}
      <div className="absolute left-3 top-4 bottom-4 w-16 bg-aerospace-900/80 border border-hud-cyan/30 rounded-lg flex flex-col items-center justify-center p-1">
        <span className="text-[9px] text-slate-400 font-bold mb-1">IAS KTS</span>
        <div className="text-base font-bold text-hud-cyan font-mono">{speed}</div>
        <div className="text-[10px] text-hud-emerald font-mono">MACH {(speed / 580 * 0.85).toFixed(2)}</div>
        <div className="w-full h-1 bg-slate-800 rounded mt-2 overflow-hidden">
          <div className="h-full bg-hud-cyan" style={{ width: `${(speed / 600) * 100}%` }} />
        </div>
      </div>

      {/* Altitude Tape (Right) */}
      <div className="absolute right-3 top-4 bottom-4 w-18 bg-aerospace-900/80 border border-hud-cyan/30 rounded-lg flex flex-col items-center justify-center p-1">
        <span className="text-[9px] text-slate-400 font-bold mb-1">ALT FT</span>
        <div className="text-base font-bold text-hud-cyan font-mono">{(alt / 1000).toFixed(1)}k</div>
        <div className="text-[10px] text-slate-300 font-mono">FL{(alt / 100).toFixed(0)}</div>
        <div className="text-[9px] text-hud-emerald font-mono mt-1">VS: {telemetry.verticalSpeedFpm} FPM</div>
      </div>

      {/* Heading Tape (Bottom) */}
      <div className="absolute bottom-2 left-24 right-24 h-7 bg-aerospace-900/90 border border-hud-cyan/30 rounded-lg flex items-center justify-center px-3">
        <span className="text-[9px] text-slate-400 mr-2 font-bold">HDG:</span>
        <span className="text-sm font-bold text-hud-cyan">{heading.toFixed(0).padStart(3, '0')}°</span>
        <span className="text-[10px] text-slate-400 ml-2">MAG / TRU</span>
      </div>

      {/* Top Banner Status */}
      <div className="absolute top-2 left-24 right-24 flex items-center justify-between text-[10px] text-slate-300 px-2 font-mono">
        <span className="text-hud-emerald font-bold">AP1 / LNAV / VNAV</span>
        <span className="text-slate-400">{telemetry.squawk ? `SQWK ${telemetry.squawk}` : 'SQWK 2000'}</span>
        <span className="text-hud-cyan font-bold">{telemetry.phase}</span>
      </div>
    </div>
  );
};
