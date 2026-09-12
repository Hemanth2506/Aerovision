import React, { useState, useEffect } from 'react';
import { AircraftTelemetry } from '../../types';
import { CircularGauge, LinearBarGauge } from '../common/TelemetryGauge';
import { HUDOverlay } from '../common/HUDOverlay';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  Gauge, 
  Activity, 
  Droplet, 
  Zap, 
  Wind, 
  Flame, 
  Sliders, 
  AlertTriangle 
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LiveTelemetryPanelProps {
  telemetry: AircraftTelemetry;
}

export const LiveTelemetryPanel: React.FC<LiveTelemetryPanelProps> = ({ telemetry }) => {
  // Rolling historical data for live strip charts
  const [history, setHistory] = useState<{
    timestamps: string[];
    eng1Egt: number[];
    eng2Egt: number[];
    eng1Vib: number[];
    eng2Vib: number[];
  }>({
    timestamps: [],
    eng1Egt: [],
    eng2Egt: [],
    eng1Vib: [],
    eng2Vib: []
  });

  useEffect(() => {
    const timeStr = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
    setHistory(prev => {
      const timestamps = [...prev.timestamps, timeStr].slice(-20);
      const eng1Egt = [...prev.eng1Egt, telemetry.engine1.egtDegC].slice(-20);
      const eng2Egt = [...prev.eng2Egt, telemetry.engine2.egtDegC].slice(-20);
      const eng1Vib = [...prev.eng1Vib, telemetry.engine1.vibrationN2].slice(-20);
      const eng2Vib = [...prev.eng2Vib, telemetry.engine2.vibrationN2].slice(-20);
      return { timestamps, eng1Egt, eng2Egt, eng1Vib, eng2Vib };
    });
  }, [telemetry]);

  const chartData = {
    labels: history.timestamps,
    datasets: [
      {
        label: 'ENG 1 EGT (°C)',
        data: history.eng1Egt,
        borderColor: '#00f0ff',
        backgroundColor: 'rgba(0, 240, 255, 0.08)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 0
      },
      {
        label: 'ENG 2 EGT (°C)',
        data: history.eng2Egt,
        borderColor: telemetry.engine2.egtDegC > 750 ? '#ff0055' : '#ffb703',
        backgroundColor: telemetry.engine2.egtDegC > 750 ? 'rgba(255, 0, 85, 0.08)' : 'rgba(255, 183, 3, 0.08)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 10 }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(8, 16, 32, 0.95)',
        titleFont: { family: 'JetBrains Mono', size: 11 },
        bodyFont: { family: 'JetBrains Mono', size: 10 }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 6 }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 } }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Aircraft Identity & Health Bar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-display font-bold text-white tracking-wide">
              {telemetry.flightNumber}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-hud-cyan/20 border border-hud-cyan/40 text-hud-cyan font-mono font-bold">
              {telemetry.model}
            </span>
            <span className="text-xs text-slate-400 font-mono">TAIL: {telemetry.tailNumber}</span>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            ROUTE: <span className="text-white font-bold">{telemetry.origin} ({telemetry.originIata})</span> → <span className="text-white font-bold">{telemetry.destination} ({telemetry.destIata})</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400 uppercase">AIRCRAFT HEALTH SCORE</div>
            <div className={`text-2xl font-bold ${
              telemetry.overallHealthScore > 85 ? 'text-hud-emerald' : telemetry.overallHealthScore > 70 ? 'text-hud-amber' : 'text-hud-crimson'
            }`}>
              {telemetry.overallHealthScore}%
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400 uppercase">SAFETY RISK INDEX</div>
            <div className={`text-2xl font-bold ${
              telemetry.riskScore < 30 ? 'text-hud-emerald' : telemetry.riskScore < 60 ? 'text-hud-amber' : 'text-hud-crimson'
            }`}>
              {telemetry.riskScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Primary Flight Display HUD & Live Telemetry Strip Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <HUDOverlay telemetry={telemetry} />
        </div>
        <div className="lg:col-span-7 p-4 rounded-2xl glass-panel flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
              <Activity className="w-4 h-4 text-hud-cyan" />
              <span>LIVE TURBOFAN EGT TREND STREAM (ACARS REALTIME)</span>
            </div>
            <span className="text-[10px] text-hud-emerald font-mono px-2 py-0.5 rounded bg-hud-emerald/10 border border-hud-emerald/30">
              ● STREAMING 10Hz
            </span>
          </div>
          <div className="h-48 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Engine 1 & Engine 2 Full Dual Telemetry Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Engine 1 LEAP / Trent Nacelle Left */}
        <div className="p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-hud-cyan">
              <Flame className="w-4 h-4 text-hud-cyan" />
              <span>ENGINE #1 (PORT) — LEAP / TRENT CORE</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-hud-emerald/10 text-hud-emerald font-mono font-bold">
              NOMINAL
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <CircularGauge label="EGT" value={telemetry.engine1.egtDegC} min={300} max={950} unit="°C" warningThreshold={740} dangerThreshold={850} />
            <CircularGauge label="N1 RPM" value={telemetry.engine1.n1Percent} min={0} max={110} unit="%" warningThreshold={95} dangerThreshold={102} />
            <CircularGauge label="N2 RPM" value={telemetry.engine1.n2Percent} min={0} max={110} unit="%" warningThreshold={96} dangerThreshold={103} />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
            <div className="p-2 rounded-lg bg-aerospace-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">FUEL FLOW:</span>
              <span className="text-white font-bold">{telemetry.engine1.fuelFlowKgHr.toLocaleString()} kg/h</span>
            </div>
            <div className="p-2 rounded-lg bg-aerospace-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">OIL PRESS:</span>
              <span className="text-white font-bold">{telemetry.engine1.oilPressurePsi} PSI</span>
            </div>
            <div className="p-2 rounded-lg bg-aerospace-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">N2 VIBRATION:</span>
              <span className="text-hud-emerald font-bold">{telemetry.engine1.vibrationN2} mm/s</span>
            </div>
          </div>
        </div>

        {/* Engine 2 LEAP / Trent Nacelle Right */}
        <div className="p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-hud-amber">
              <Flame className="w-4 h-4 text-hud-amber" />
              <span>ENGINE #2 (STARBOARD) — LEAP / TRENT CORE</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              telemetry.engine2.egtDegC > 750 ? 'bg-hud-crimson/20 text-hud-crimson animate-pulse' : 'bg-hud-emerald/10 text-hud-emerald'
            }`}>
              {telemetry.engine2.egtDegC > 750 ? 'EXCEEDANCE' : 'MONITORED'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <CircularGauge label="EGT" value={telemetry.engine2.egtDegC} min={300} max={950} unit="°C" warningThreshold={740} dangerThreshold={850} />
            <CircularGauge label="N1 RPM" value={telemetry.engine2.n1Percent} min={0} max={110} unit="%" warningThreshold={95} dangerThreshold={102} />
            <CircularGauge label="N2 RPM" value={telemetry.engine2.n2Percent} min={0} max={110} unit="%" warningThreshold={96} dangerThreshold={103} />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
            <div className="p-2 rounded-lg bg-aerospace-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">FUEL FLOW:</span>
              <span className="text-white font-bold">{telemetry.engine2.fuelFlowKgHr.toLocaleString()} kg/h</span>
            </div>
            <div className="p-2 rounded-lg bg-aerospace-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">OIL PRESS:</span>
              <span className="text-white font-bold">{telemetry.engine2.oilPressurePsi} PSI</span>
            </div>
            <div className="p-2 rounded-lg bg-aerospace-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">N2 VIBRATION:</span>
              <span className={`font-bold ${telemetry.engine2.vibrationN2 > 1.0 ? 'text-hud-crimson' : 'text-hud-emerald'}`}>
                {telemetry.engine2.vibrationN2} mm/s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auxiliary Systems Telemetry (Hydraulics, Cabin Pressurization, Fuel Distribution) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hydraulic Triplex Circuits */}
        <div className="p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
            <Droplet className="w-4 h-4 text-blue-400" />
            <span>ATA 29 HYDRAULIC PRESSURE</span>
          </div>
          <div className="space-y-2">
            <LinearBarGauge label="System A Circuit" value={telemetry.hydraulics.systemAPressurePsi} max={3500} unit="PSI" warningThreshold={85} />
            <LinearBarGauge label="System B Circuit" value={telemetry.hydraulics.systemBPressurePsi} max={3500} unit="PSI" warningThreshold={85} />
            <LinearBarGauge label="System C Circuit" value={telemetry.hydraulics.systemCPressurePsi} max={3500} unit="PSI" warningThreshold={85} />
          </div>
        </div>

        {/* Environmental & Avionics */}
        <div className="p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
            <Wind className="w-4 h-4 text-hud-cyan" />
            <span>ATA 21 ENVIRONMENTAL & AVIONICS</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">CABIN ALTITUDE:</span>
              <span className="text-sm font-bold text-hud-cyan">{telemetry.avionics.cabinAltitudeFt.toLocaleString()} FT</span>
            </div>
            <div className="p-2.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">DIFF PRESSURE:</span>
              <span className="text-sm font-bold text-white">{telemetry.avionics.differentialPressurePsi} PSI</span>
            </div>
            <div className="p-2.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">AC BUS VOLTAGE:</span>
              <span className="text-sm font-bold text-hud-emerald">{telemetry.avionics.electricalBusVoltageV} V</span>
            </div>
            <div className="p-2.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">BATTERY CHARGE:</span>
              <span className="text-sm font-bold text-hud-emerald">{telemetry.avionics.batteryChargePercent}%</span>
            </div>
          </div>
        </div>

        {/* Fuel Flow & Sustainability Optimization */}
        <div className="p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>ATA 73 FUEL & EMISSIONS INDEX</span>
          </div>
          <div className="space-y-2">
            <LinearBarGauge label="Total Fuel Onboard" value={telemetry.fuel.totalQuantityKg} max={80000} unit="KG" />
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2 rounded-lg bg-aerospace-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">BURN RATE:</span>
                <span className="text-hud-amber font-bold">{telemetry.fuel.fuelBurnRateTotalKgHr.toLocaleString()} kg/h</span>
              </div>
              <div className="p-2 rounded-lg bg-aerospace-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">COST INDEX:</span>
                <span className="text-hud-cyan font-bold">{telemetry.fuel.costIndex}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
