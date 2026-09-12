import React, { useState } from 'react';
import { AircraftTelemetry } from '../../types';
import { Leaf, Zap, TrendingUp, Sliders, DollarSign, Globe, BarChart2 } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';

interface FuelSustainabilityCenterProps {
  telemetry: AircraftTelemetry;
}

export const FuelSustainabilityCenter: React.FC<FuelSustainabilityCenterProps> = ({ telemetry }) => {
  const [costIndex, setCostIndex] = useState<number>(telemetry.fuel.costIndex || 35);
  const [safBlendPercent, setSafBlendPercent] = useState<number>(30); // 30% SAF Blend

  // Calculate fuel burn vs time cost curves across Cost Index range (0 to 100)
  const ciRange = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const fuelCosts = ciRange.map(ci => 2200 + (ci / 100) ** 1.3 * 900);
  const timeCosts = ciRange.map(ci => 3100 - (ci / 100) * 1100);
  const totalOperatingCosts = ciRange.map((ci, i) => fuelCosts[i] + timeCosts[i]);

  const ciChartData = {
    labels: ciRange.map(ci => `CI ${ci}`),
    datasets: [
      {
        label: 'Total Direct Operating Cost ($/hr)',
        data: totalOperatingCosts,
        borderColor: '#00f0ff',
        backgroundColor: 'rgba(0, 240, 255, 0.1)',
        borderWidth: 2.5,
        tension: 0.35,
        fill: true
      },
      {
        label: 'Fuel Burn Cost ($/hr)',
        data: fuelCosts,
        borderColor: '#ffb703',
        borderDash: [4, 4],
        borderWidth: 1.5
      },
      {
        label: 'Time / Maintenance Cost ($/hr)',
        data: timeCosts,
        borderColor: '#00ff88',
        borderDash: [4, 4],
        borderWidth: 1.5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#64748b',
          font: { family: 'JetBrains Mono', size: 9 },
          callback: (value: number | string) => `$${value}`
        }
      }
    }
  };

  // CO2 Abatement Calculations
  const co2PerKgFuel = 3.16; // Standard ICAO metric: 3.16 kg CO2 per kg Jet-A
  const totalBurnRate = telemetry.fuel.fuelBurnRateTotalKgHr;
  const standardCo2EmissionKgHr = Math.round(totalBurnRate * co2PerKgFuel);
  const safCo2SavingsPercent = (safBlendPercent * 0.8); // 80% lifecycle reduction on SAF fraction
  const netCo2EmissionKgHr = Math.round(standardCo2EmissionKgHr * (1 - safCo2SavingsPercent / 100));
  const totalCo2SavedKgHr = standardCo2EmissionKgHr - netCo2EmissionKgHr;

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-hud-glow-green">
              <Leaf className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                FUEL EFFICIENCY & ESG SUSTAINABILITY OPTIMIZATION
              </h1>
              <p className="text-xs text-slate-400">
                FMS Cost Index Optimization • Sustainable Aviation Fuel (SAF) Lifecycle Abatement • Continuous Descent CDA
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">MONITORED TARGET:</span>
          <span className="px-2.5 py-1 rounded bg-hud-cyan/20 border border-hud-cyan/40 text-hud-cyan font-bold">
            {telemetry.flightNumber} ({telemetry.model})
          </span>
        </div>
      </div>

      {/* Top ESG KPI Cards */}
      <div className="p-4 rounded-2xl glass-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">ACTIVE FUEL BURN RATE</div>
          <div className="text-2xl font-bold text-hud-amber mt-1">
            {telemetry.fuel.fuelBurnRateTotalKgHr.toLocaleString()} kg/hr
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Total Onboard: {telemetry.fuel.totalQuantityKg.toLocaleString()} kg</div>
        </div>

        <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">NET CO2 EMISSIONS</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {(netCo2EmissionKgHr / 1000).toFixed(2)} Tons/hr
          </div>
          <div className="text-[10px] text-slate-500 mt-1">With {safBlendPercent}% SAF Blend</div>
        </div>

        <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">CO2 ABATEMENT RATE</div>
          <div className="text-2xl font-bold text-hud-cyan mt-1">
            -{totalCo2SavedKgHr.toLocaleString()} kg/hr
          </div>
          <div className="text-[10px] text-hud-emerald mt-1">🌿 {safCo2SavingsPercent.toFixed(1)}% Net Reduction</div>
        </div>

        <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">OPTIMAL COST INDEX</div>
          <div className="text-2xl font-bold text-white mt-1">CI {costIndex}</div>
          <div className="text-[10px] text-slate-500 mt-1">Min Direct Operating Cost</div>
        </div>
      </div>

      {/* Cost Index Interactive Optimizer Chart */}
      <div className="p-4 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              FLIGHT MANAGEMENT SYSTEM (FMS) COST INDEX CURVE
            </h3>
            <p className="text-slate-400 text-xs">
              Direct Operating Cost (DOC) minimum balance between fuel consumption and hourly airframe/crew cost.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">ADJUST CI:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={costIndex}
              onChange={(e) => setCostIndex(Number(e.target.value))}
              className="w-32 accent-hud-cyan"
            />
            <span className="font-bold text-hud-cyan text-sm">{costIndex}</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <Line data={ciChartData} options={chartOptions} />
        </div>
      </div>

      {/* Sustainable Aviation Fuel (SAF) Calculator & CDA Descent Savings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SAF Blend Simulator */}
        <div className="lg:col-span-6 p-4 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-display font-bold text-base text-white">
              <Leaf className="w-5 h-5 text-emerald-400" />
              <span>SUSTAINABLE AVIATION FUEL (SAF) BLEND</span>
            </div>
            <span className="text-hud-emerald font-bold">{safBlendPercent}% Blend</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Select SAF HEFA / PtL Blend:</span>
                <span className="font-bold text-white">{safBlendPercent}% Synthetic Kerosene</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={safBlendPercent}
                onChange={(e) => setSafBlendPercent(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">STANDARD JET-A1:</span>
                <span className="text-sm font-bold text-slate-300">{(standardCo2EmissionKgHr / 1000).toFixed(2)} Tons CO2/hr</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800">
                <span className="text-[10px] text-emerald-400 block">WITH {safBlendPercent}% SAF:</span>
                <span className="text-sm font-bold text-emerald-300">{(netCo2EmissionKgHr / 1000).toFixed(2)} Tons CO2/hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Continuous Descent Approach (CDA) Savings */}
        <div className="lg:col-span-6 p-4 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-base text-white border-b border-slate-800 pb-3">
            <Zap className="w-5 h-5 text-hud-cyan" />
            <span>CONTINUOUS DESCENT OPERATIONS (CDO / CDA)</span>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-400 leading-relaxed">
              Continuous 3.0° idle thrust descents eliminate intermediate level-offs, drastically cutting terminal airspace noise and fuel burn.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">AVERAGE FUEL SAVINGS:</span>
                <span className="text-base font-bold text-hud-emerald">160 kg / Approach</span>
              </div>
              <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">CO2 REDUCTION PER FLIGHT:</span>
                <span className="text-base font-bold text-hud-cyan">505 kg CO2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
