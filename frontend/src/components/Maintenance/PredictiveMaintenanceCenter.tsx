import React, { useState } from 'react';
import { AircraftTelemetry } from '../../types';
import { RULForecastingChart } from './RULForecastingChart';
import { AnomalyDetectionPanel } from './AnomalyDetectionPanel';
import { WorkOrderManager } from './WorkOrderManager';
import { Cpu, TrendingDown, Activity, Wrench, ShieldCheck } from 'lucide-react';

interface PredictiveMaintenanceCenterProps {
  telemetry: AircraftTelemetry;
}

export const PredictiveMaintenanceCenter: React.FC<PredictiveMaintenanceCenterProps> = ({ telemetry }) => {
  const [activeTab, setActiveTab] = useState<'RUL' | 'ANOMALIES' | 'WORK_ORDERS'>('RUL');

  return (
    <div className="space-y-5">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-hud-amber/15 border border-hud-amber/40 text-hud-amber shadow-hud-glow-amber">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                AI PREDICTIVE MAINTENANCE & RUL PROGNOSTICS
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Component Degradation Modeling • Remaining Useful Life (RUL) • Automated ATA Work Order Dispatch
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-aerospace-900/90 border border-slate-800 rounded-xl p-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('RUL')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'RUL'
                ? 'bg-hud-amber/20 border border-hud-amber/50 text-hud-amber font-bold shadow-hud-glow-amber'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>RUL WEIBULL FORECAST</span>
          </button>
          <button
            onClick={() => setActiveTab('ANOMALIES')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'ANOMALIES'
                ? 'bg-hud-amber/20 border border-hud-amber/50 text-hud-amber font-bold shadow-hud-glow-amber'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>AI ANOMALY DETECTOR</span>
          </button>
          <button
            onClick={() => setActiveTab('WORK_ORDERS')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'WORK_ORDERS'
                ? 'bg-hud-amber/20 border border-hud-amber/50 text-hud-amber font-bold shadow-hud-glow-amber'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>ATA WORK ORDERS</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <RULForecastingChart telemetry={telemetry} />
      <AnomalyDetectionPanel telemetry={telemetry} />
      <WorkOrderManager telemetry={telemetry} />
    </div>
  );
};
