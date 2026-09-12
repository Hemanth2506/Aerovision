import React from 'react';
import { Line } from 'react-chartjs-2';
import { AircraftTelemetry } from '../../types';
import { TrendingDown, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

interface RULForecastingChartProps {
  telemetry: AircraftTelemetry;
}

export const RULForecastingChart: React.FC<RULForecastingChartProps> = ({ telemetry }) => {
  // Generate predictive degradation curve data over flight cycles (0 to 2000 cycles)
  const cycles = [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000];

  // Engine 1 (Nominal health)
  const eng1Health = cycles.map(c => Math.max(0, 100 - (c / 2000) ** 1.4 * 35));

  // Engine 2 (Degrading faster due to thermal creep)
  const eng2Health = cycles.map(c => Math.max(0, 100 - (c / 1400) ** 1.8 * 65));

  // 95% Confidence Upper and Lower bounds for Engine 2
  const eng2Upper = eng2Health.map(h => Math.min(100, h + 4));
  const eng2Lower = eng2Health.map(h => Math.max(0, h - 5));

  const chartData = {
    labels: cycles.map(c => `${c} Cycles`),
    datasets: [
      {
        label: 'Engine 1 Turbofan Health (Nominal)',
        data: eng1Health,
        borderColor: '#00ff88',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 3
      },
      {
        label: 'Engine 2 Turbofan Health (Degrading)',
        data: eng2Health,
        borderColor: '#ff0055',
        backgroundColor: 'rgba(255, 0, 85, 0.1)',
        borderWidth: 2.5,
        tension: 0.35,
        fill: '+1',
        pointRadius: 4
      },
      {
        label: '95% Confidence Upper Bound',
        data: eng2Upper,
        borderColor: 'rgba(255, 183, 3, 0.4)',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false
      },
      {
        label: '95% Confidence Lower Bound',
        data: eng2Lower,
        borderColor: 'rgba(255, 0, 85, 0.4)',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: '-1',
        backgroundColor: 'rgba(255, 0, 85, 0.06)'
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
      },
      tooltip: {
        backgroundColor: 'rgba(8, 16, 32, 0.95)',
        titleFont: { family: 'JetBrains Mono', size: 11 },
        bodyFont: { family: 'JetBrains Mono', size: 10 }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 } }
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#64748b',
          font: { family: 'JetBrains Mono', size: 9 },
          callback: (value: number | string) => `${value}%`
        }
      }
    }
  };

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <TrendingDown className="w-5 h-5 text-hud-amber" />
          <div>
            <h3 className="font-display font-bold text-base text-white">
              REMAINING USEFUL LIFE (RUL) WEIBULL DEGRADATION FORECAST
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Machine Learning Prognostics • Weibull Hazard Rate & Polynomial Failure Regression
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-hud-emerald" />
            <span className="text-slate-300">ENG 1 RUL: <b>3,420 hrs (1,180 cyc)</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-hud-crimson" />
            <span className="text-slate-300">ENG 2 RUL: <b className="text-hud-crimson">320 hrs (95 cyc)</b></span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Prognostic Threshold Alert Banner */}
      <div className="p-3 rounded-xl bg-aerospace-900/80 border border-hud-amber/30 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-hud-amber">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            <b>PROGNOSTIC ADVISORY:</b> Engine 2 RUL degradation trajectory will cross the <b>50% Health Critical Threshold</b> in approximately <b>68 Flight Cycles</b>.
          </span>
        </div>
        <span className="text-[10px] text-slate-400 shrink-0">MODEL CONFIDENCE: 96.4%</span>
      </div>
    </div>
  );
};
