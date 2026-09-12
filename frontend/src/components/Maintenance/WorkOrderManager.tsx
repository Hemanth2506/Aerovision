import React, { useState } from 'react';
import { MaintenanceWorkOrder, AircraftTelemetry } from '../../types';
import { INITIAL_WORK_ORDERS } from '../../data/mockData';
import { ReportExporter } from '../../services/reportExporter';
import { 
  Wrench, 
  Plus, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  UserCheck, 
  DollarSign, 
  Package, 
  Layers 
} from 'lucide-react';

interface WorkOrderManagerProps {
  telemetry: AircraftTelemetry;
}

export const WorkOrderManager: React.FC<WorkOrderManagerProps> = ({ telemetry }) => {
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>(INITIAL_WORK_ORDERS);
  const [filter, setFilter] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // New Work Order form state
  const [newTitle, setNewTitle] = useState('');
  const [newAta, setNewAta] = useState('ATA-72 Engine / Turbofan Core');
  const [newUrgency, setNewUrgency] = useState<'ROUTINE' | 'ADVISORY' | 'URGENT_24H' | 'AOG_CRITICAL'>('URGENT_24H');
  const [newDescription, setNewDescription] = useState('');
  const [newTech, setNewTech] = useState('Senior Line Specialist');

  const filteredOrders = workOrders.filter(wo => {
    if (filter === 'ALL') return true;
    return wo.status === filter;
  });

  const handleUpdateStatus = (id: string, newStatus: MaintenanceWorkOrder['status']) => {
    setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, status: newStatus } : wo));
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newWO: MaintenanceWorkOrder = {
      id: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      aircraftId: telemetry.aircraftId,
      tailNumber: telemetry.tailNumber,
      ataChapter: newAta,
      title: newTitle,
      description: newDescription || 'Automated maintenance action generated via AeroVision AI Predictive Health Engine.',
      urgency: newUrgency,
      healthImpactScore: newUrgency === 'AOG_CRITICAL' ? 45 : newUrgency === 'URGENT_24H' ? 25 : 10,
      estimatedLaborHours: 4.5,
      requiredParts: ['OEM Standard Seal Kit', 'Replacement Sensor / Assembly'],
      assignedTechnician: newTech,
      status: 'ASSIGNED',
      createdTimestamp: new Date().toISOString(),
      dueTimestamp: new Date(Date.now() + 86400000).toISOString(),
      predictedFailureRisk: newUrgency === 'AOG_CRITICAL' ? 85 : 35,
      costEstimateUsd: newUrgency === 'AOG_CRITICAL' ? 24000 : 8500
    };

    setWorkOrders([newWO, ...workOrders]);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Wrench className="w-5 h-5 text-hud-amber" />
          <div>
            <h3 className="font-display font-bold text-base text-white">
              ATA CHAPTER MAINTENANCE WORK ORDER DISPATCH
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Automated MRO Scheduling • CAMO Airworthiness Directives • Line & Base Turnaround
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => ReportExporter.exportWorkOrdersExcel(workOrders)}
            className="px-3 py-1.5 rounded-xl bg-aerospace-900 border border-hud-emerald/40 hover:bg-hud-emerald/20 text-hud-emerald font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-hud-glow-green"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>EXPORT XLSX</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-hud-cyan text-black hover:bg-hud-cyan/90 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-hud-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW WORK ORDER</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-1 bg-aerospace-900/80 border border-slate-800 rounded-xl p-1 text-xs font-mono w-fit">
        {['ALL', 'IN_PROGRESS', 'ASSIGNED', 'PENDING_APPROVAL', 'COMPLETED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filter === st
                ? 'bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Work Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((wo) => {
          return (
            <div
              key={wo.id}
              className="p-4 rounded-xl bg-aerospace-900/70 border border-slate-800/80 hover:border-hud-cyan/30 text-xs font-mono space-y-2.5 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-hud-cyan text-sm">{wo.id}</span>
                  <span className="text-slate-400">({wo.tailNumber})</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 font-bold">
                    {wo.ataChapter}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    wo.urgency === 'AOG_CRITICAL'
                      ? 'bg-hud-crimson/20 text-hud-crimson animate-pulse'
                      : wo.urgency === 'URGENT_24H'
                      ? 'bg-hud-amber/20 text-hud-amber'
                      : 'bg-hud-emerald/10 text-hud-emerald'
                  }`}>
                    {wo.urgency.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {wo.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm mb-1">{wo.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{wo.description}</p>
              </div>

              {/* Parts & Tech Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-hud-cyan shrink-0" />
                  <span>TECH: <b className="text-white">{wo.assignedTechnician}</b></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-hud-amber shrink-0" />
                  <span>PARTS: <b className="text-white">{wo.requiredParts.join(', ')}</b></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-hud-emerald shrink-0" />
                  <span>EST. COST: <b className="text-hud-emerald">${wo.costEstimateUsd.toLocaleString()}</b></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                <span className="text-slate-500">DUE BY: {new Date(wo.dueTimestamp).toLocaleString()}</span>
                <div className="flex items-center gap-1.5">
                  {wo.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleUpdateStatus(wo.id, 'COMPLETED')}
                      className="px-2.5 py-1 rounded bg-hud-emerald/20 border border-hud-emerald/50 text-hud-emerald hover:bg-hud-emerald/30 font-bold transition-colors"
                    >
                      ✓ Mark Completed
                    </button>
                  )}
                  {wo.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleUpdateStatus(wo.id, 'ASSIGNED')}
                      className="px-2.5 py-1 rounded bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan hover:bg-hud-cyan/30 font-bold transition-colors"
                    >
                      Approve & Dispatch →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Work Order Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateOrder}
            className="w-full max-w-lg bg-aerospace-900 border border-hud-cyan/40 rounded-2xl p-6 shadow-2xl space-y-4 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-base text-white">DISPATCH MRO WORK ORDER</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">WORK ORDER TITLE</label>
              <input
                type="text"
                required
                placeholder="e.g. Engine 2 Turbine Blade Borescope & Coating Inspection"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 rounded-lg bg-aerospace-950 border border-slate-700 text-white focus:outline-none focus:border-hud-cyan"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">ATA CHAPTER</label>
                <select
                  value={newAta}
                  onChange={(e) => setNewAta(e.target.value)}
                  className="w-full p-2 rounded-lg bg-aerospace-950 border border-slate-700 text-white focus:outline-none focus:border-hud-cyan"
                >
                  <option>ATA-72 Engine / Turbofan Core</option>
                  <option>ATA-29 Hydraulic Power</option>
                  <option>ATA-32 Landing Gear & Brakes</option>
                  <option>ATA-21 Air Conditioning & Pressurization</option>
                  <option>ATA-49 Auxiliary Power Unit (APU)</option>
                  <option>ATA-34 Navigation & Pitot-Static</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">URGENCY PRIORITY</label>
                <select
                  value={newUrgency}
                  onChange={(e) => setNewUrgency(e.target.value as any)}
                  className="w-full p-2 rounded-lg bg-aerospace-950 border border-slate-700 text-white focus:outline-none focus:border-hud-cyan"
                >
                  <option value="ROUTINE">ROUTINE (A-Check)</option>
                  <option value="ADVISORY">ADVISORY (Next Line Check)</option>
                  <option value="URGENT_24H">URGENT (24-Hour Turn)</option>
                  <option value="AOG_CRITICAL">AOG CRITICAL (Ground Stop)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ASSIGNED LEAD TECHNICIAN</label>
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                className="w-full p-2 rounded-lg bg-aerospace-950 border border-slate-700 text-white focus:outline-none focus:border-hud-cyan"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">DETAILED ACTION DESCRIPTION</label>
              <textarea
                rows={3}
                placeholder="Specific AMM procedures, required torque values, seal replacements..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 rounded-lg bg-aerospace-950 border border-slate-700 text-white focus:outline-none focus:border-hud-cyan"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-hud-cyan text-black font-bold hover:bg-hud-cyan/90"
              >
                Create & Dispatch Work Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
