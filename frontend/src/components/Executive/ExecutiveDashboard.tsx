import React from 'react';
import { AircraftTelemetry, MaintenanceWorkOrder, OperationalAlert } from '../../types';
import { BarChart3, TrendingUp, ShieldCheck, DollarSign, Clock, Plane, FileText } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement } from 'chart.js';

ChartJS.register(ArcElement);

interface ExecutiveDashboardProps {
  fleet: AircraftTelemetry[];
  workOrders: MaintenanceWorkOrder[];
  alerts: OperationalAlert[];
  onOpenReports: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  fleet,
  workOrders,
  alerts,
  onOpenReports
}) => {
  const avgHealth = Math.round(fleet.reduce((acc, a) => acc + a.overallHealthScore, 0) / fleet.length);
  const totalCost = workOrders.reduce((acc, wo) => acc + wo.costEstimateUsd, 0);

  // Fleet airframe breakdown
  const fleetDistribution = {
    labels: ['Boeing 787-9', 'Airbus A350-900', 'Boeing 777-300ER', 'Airbus A321neo', 'Airbus A380-800'],
    datasets: [
      {
        data: [4, 3, 3, 4, 2],
        backgroundColor: ['#00f0ff', '#8b5cf6', '#3b82f6', '#00ff88', '#ffb703'],
        borderColor: '#030712',
        borderWidth: 2
      }
    ]
  };

  // Reliability historical trend
  const reliabilityTrend = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Fleet Dispatch Reliability (%)',
        data: [98.8, 99.1, 98.9, 99.2, 99.4, 99.3, 99.5, 99.4],
        borderColor: '#00f0ff',
        backgroundColor: 'rgba(0, 240, 255, 0.1)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true
      },
      {
        label: 'On-Time Performance A14 (%)',
        data: [86.2, 87.5, 88.1, 87.8, 89.0, 88.6, 89.4, 89.2],
        borderColor: '#00ff88',
        borderDash: [4, 4],
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-hud-glow">
              <BarChart3 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                EXECUTIVE C-SUITE LEADERSHIP & FLEET ROI
              </h1>
              <p className="text-xs text-slate-400">
                Dispatch Reliability • Unscheduled AOG Prevention • Fleet Utilization & ESG Carbon Scorecard
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenReports}
          className="px-4 py-2 rounded-xl bg-hud-cyan text-black font-bold flex items-center gap-2 hover:bg-hud-cyan/90 transition-all shadow-hud-glow"
        >
          <FileText className="w-4 h-4" />
          <span>GENERATE EXECUTIVE PDF DOSSIER</span>
        </button>
      </div>

      {/* High-Level C-Suite Metric Tiles */}
      <div className="p-4 rounded-2xl glass-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">DISPATCH RELIABILITY</div>
          <div className="text-2xl font-bold text-hud-emerald mt-1">99.4%</div>
          <div className="text-[10px] text-slate-500 mt-1">Industry Tier-1 Benchmark (&gt;99.0%)</div>
        </div>

        <div className="p-3.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">UNSCHEDULED AOG PREVENTED</div>
          <div className="text-2xl font-bold text-hud-cyan mt-1">$4.25M YTD</div>
          <div className="text-[10px] text-hud-emerald mt-1">🌿 8 Major Groundings Averted</div>
        </div>

        <div className="p-3.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">MEAN TIME BETWEEN FAULTS</div>
          <div className="text-2xl font-bold text-white mt-1">4,820 Flight Hrs</div>
          <div className="text-[10px] text-slate-500 mt-1">+14% vs Historical Baseline</div>
        </div>

        <div className="p-3.5 rounded-xl bg-aerospace-900/80 border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase">AVG FLEET HEALTH INDEX</div>
          <div className="text-2xl font-bold text-hud-cyan mt-1">{avgHealth} / 100</div>
          <div className="text-[10px] text-slate-500 mt-1">{fleet.length} Monitored Commercial Airframes</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Trend Line */}
        <div className="lg:col-span-8 p-4 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-base text-white">
              DISPATCH RELIABILITY & ON-TIME PERFORMANCE (OTP A14)
            </h3>
            <span className="text-slate-400 text-xs">2026 YTD PERFORMANCE</span>
          </div>
          <div className="h-64 w-full">
            <Line
              data={reliabilityTrend}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } }
                  }
                },
                scales: {
                  x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
                  y: { min: 80, max: 100, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } }
                }
              }}
            />
          </div>
        </div>

        {/* Fleet Composition Donut */}
        <div className="lg:col-span-4 p-4 rounded-2xl glass-panel space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-display font-bold text-base text-white">FLEET COMPOSITION</h3>
            <span className="text-slate-400 text-xs">Active Airframes</span>
          </div>
          <div className="h-48 flex items-center justify-center">
            <Doughnut
              data={fleetDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 9 } } }
                }
              }}
            />
          </div>
          <div className="text-center text-[10px] text-slate-500 pt-1">
            Total Commercial Fleet Asset Valuation: $2.85B
          </div>
        </div>
      </div>
    </div>
  );
};
