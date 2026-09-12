import React, { useState } from 'react';
import { AircraftTelemetry, MaintenanceWorkOrder, OperationalAlert } from '../../types';
import { ReportExporter } from '../../services/reportExporter';
import { FileText, FileSpreadsheet, Download, CheckCircle, ShieldAlert, Sparkles, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportsCenterProps {
  telemetry: AircraftTelemetry;
  fleet: AircraftTelemetry[];
  workOrders: MaintenanceWorkOrder[];
  alerts: OperationalAlert[];
}

export const ReportsCenter: React.FC<ReportsCenterProps> = ({
  telemetry,
  fleet,
  workOrders,
  alerts
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [lastExported, setLastExported] = useState<string | null>(null);

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      ReportExporter.exportExecutivePDF(telemetry, fleet, workOrders, alerts);
      setIsExporting(false);
      setLastExported('PDF Executive Dossier');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    }, 400);
  };

  const handleExportExcel = () => {
    ReportExporter.exportWorkOrdersExcel(workOrders);
    setLastExported('Maintenance Work Orders Excel');
  };

  const handleExportCSV = () => {
    ReportExporter.exportTelemetryCSV(fleet);
    setLastExported('Fleet Telemetry CSV');
  };

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-hud-cyan/20 border border-hud-cyan/40 text-hud-cyan shadow-hud-glow">
              <FileText className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                OPERATIONAL REPORTS & INTELLIGENCE DOSSIERS
              </h1>
              <p className="text-xs text-slate-400">
                Automated Aerospace Executive Briefings • MRO Work Order Manifests • ICAO Annex 13 Compliance Logs
              </p>
            </div>
          </div>
        </div>

        {lastExported && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-hud-emerald/15 border border-hud-emerald/40 text-hud-emerald">
            <CheckCircle className="w-4 h-4" />
            <span>Exported: {lastExported}</span>
          </div>
        )}
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PDF Executive Dossier */}
        <div className="p-5 rounded-2xl glass-panel space-y-4 flex flex-col justify-between border border-hud-cyan/40 shadow-hud-glow">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-hud-cyan/20 border border-hud-cyan/40 text-hud-cyan flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Executive Management PDF Dossier</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Complete formatted aerospace intelligence report including fleet availability, monitored turbofan EGT metrics, predictive RUL health degradation, and active safety occurrence notices.
            </p>
          </div>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full py-2.5 rounded-xl bg-hud-cyan hover:bg-hud-cyan/90 text-black font-bold flex items-center justify-center gap-2 transition-all shadow-hud-glow"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF Dossier'}</span>
          </button>
        </div>

        {/* Excel Work Orders */}
        <div className="p-5 rounded-2xl glass-panel space-y-4 flex flex-col justify-between border border-hud-emerald/40 shadow-hud-glow-green">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-hud-emerald/20 border border-hud-emerald/40 text-hud-emerald flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">MRO Work Orders (Excel .xlsx)</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Comprehensive maintenance dispatch spreadsheet with ATA chapter classifications, technician assignments, spare parts lists, and failure risk probabilities.
            </p>
          </div>

          <button
            onClick={handleExportExcel}
            className="w-full py-2.5 rounded-xl bg-hud-emerald hover:bg-hud-emerald/90 text-black font-bold flex items-center justify-center gap-2 transition-all shadow-hud-glow-green"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>

        {/* Telemetry Dataset CSV */}
        <div className="p-5 rounded-2xl glass-panel space-y-4 flex flex-col justify-between border border-hud-amber/40 shadow-hud-glow-amber">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-hud-amber/20 border border-hud-amber/40 text-hud-amber flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Fleet Telemetry Dataset (CSV)</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Raw telemetry streaming logs for all active airborne airframes including dual-engine EGT, N1/N2 RPM, hydraulic pressures, GPS coordinates, and fuel burn rates.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="w-full py-2.5 rounded-xl bg-hud-amber hover:bg-hud-amber/90 text-black font-bold flex items-center justify-center gap-2 transition-all shadow-hud-glow-amber"
          >
            <Download className="w-4 h-4" />
            <span>Export Telemetry CSV</span>
          </button>
        </div>
      </div>

      {/* Dossier Preview Panel */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-display font-bold text-base text-white">LIVE DOSSIER CONTENT PREVIEW</h3>
          <span className="text-slate-400 text-xs">TARGET: {telemetry.flightNumber} ({telemetry.model})</span>
        </div>

        <div className="p-4 rounded-xl bg-aerospace-950/90 border border-slate-800 space-y-3 text-slate-300 text-xs">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center text-hud-cyan font-bold">
            <span>AEROVISION INTELLIGENCE DOSSIER SUMMARY</span>
            <span className="text-slate-500">CONFIDENTIAL COMMERCIAL DIRECTIVE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-slate-500 block text-[10px]">MONITORED AIRFRAME:</span>
              <span className="font-bold text-white">{telemetry.flightNumber} • {telemetry.tailNumber} ({telemetry.model})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ROUTE & ALTITUDE:</span>
              <span className="font-bold text-white">{telemetry.originIata} → {telemetry.destIata} • FL{(telemetry.altitudeFt/100).toFixed(0)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">OVERALL HEALTH & RISK:</span>
              <span className="font-bold text-hud-emerald">{telemetry.overallHealthScore}% Health • {telemetry.riskScore}/100 Risk</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            Engine 1 EGT: <b>{telemetry.engine1.egtDegC}°C</b> | Engine 2 EGT: <b>{telemetry.engine2.egtDegC}°C</b> (Margin: {telemetry.engine2.egtMarginDegC}°C) | Hydraulic System A/B: <b>{telemetry.hydraulics.systemAPressurePsi}/{telemetry.hydraulics.systemBPressurePsi} PSI</b> | Total Fuel: <b>{telemetry.fuel.totalQuantityKg.toLocaleString()} kg</b>
          </div>
        </div>
      </div>
    </div>
  );
};
