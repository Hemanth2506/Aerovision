import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckSquare, Square, Volume2, RotateCcw } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface ChecklistStep {
  id: string;
  item: string;
  action: string;
  completed: boolean;
}

interface Checklist {
  id: string;
  title: string;
  squawkCode: string;
  category: string;
  steps: ChecklistStep[];
}

export const EmergencyChecklists: React.FC = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([
    {
      id: 'QRH-72-01',
      title: 'ENGINE 2 SEVERE VIBRATION / OVERHEAT (ATA 72)',
      squawkCode: '7700 (MAYDAY / PAN-PAN)',
      category: 'ENGINE DANGER',
      steps: [
        { id: 's1', item: 'Thrust Lever (Affected Engine)', action: 'CONFIRM & IDLE', completed: false },
        { id: 's2', item: 'Auto-Throttle', action: 'DISENGAGE (L / R)', completed: false },
        { id: 's3', item: 'EGT & Vibration Telemetry', action: 'MONITOR EXCEEDANCE DECAY', completed: false },
        { id: 's4', item: 'Engine Master Switch', action: 'OFF (IF VIBRATION PERSISTS)', completed: false },
        { id: 's5', item: 'Air Traffic Control (ATC)', action: 'DECLARE PAN-PAN & REQUEST DIVERSION', completed: false },
        { id: 's6', item: 'FMS Diversion Page', action: 'ACTIVATE NEAREST SUITABLE RUNWAY', completed: false }
      ]
    },
    {
      id: 'QRH-21-01',
      title: 'RAPID CABIN DEPRESSURIZATION & EMERGENCY DESCENT',
      squawkCode: '7700 (EMERGENCY)',
      category: 'CABIN ALTITUDE',
      steps: [
        { id: 'c1', item: 'Crew Oxygen Masks', action: 'ON / 100% EMERGENCY', completed: false },
        { id: 'c2', item: 'Crew Communications', action: 'ESTABLISH INTERCOM', completed: false },
        { id: 'c3', item: 'Passenger Oxygen Switch', action: 'MANUAL ON / MASKS DEPLOYED', completed: false },
        { id: 'c4', item: 'Altitude Target', action: 'SELECT 10,000 FT (OR MEA)', completed: false },
        { id: 'c5', item: 'Thrust Levers & Speedbrakes', action: 'IDLE / FULL EXTENSION', completed: false },
        { id: 'c6', item: 'Airspeed', action: 'MAX OPERATING VMO / MMO', completed: false }
      ]
    },
    {
      id: 'QRH-29-01',
      title: 'HYDRAULIC CIRCUIT B COMPLETE PRESSURE LOSS',
      squawkCode: 'NORMAL',
      category: 'HYDRAULIC REDUNDANCY',
      steps: [
        { id: 'h1', item: 'System B Electric Pump', action: 'OFF / ISOLATED', completed: false },
        { id: 'h2', item: 'PTU (Power Transfer Unit)', action: 'VERIFY AUTO-INHIBIT', completed: false },
        { id: 'h3', item: 'Landing Gear Extension', action: 'PREPARE GRAVITY FREE-FALL DROP', completed: false },
        { id: 'h4', item: 'Flap / Slat Profile', action: 'SLATS ONLY / FLAP 3 RESTRICTED', completed: false },
        { id: 'h5', item: 'Landing Distance Factor', action: 'APPLY 1.35x BRAKING DISTANCE', completed: false }
      ]
    }
  ]);

  const [activeChecklistId, setActiveChecklistId] = useState<string>('QRH-72-01');

  const activeChecklist = checklists.find(c => c.id === activeChecklistId) || checklists[0];

  const toggleStep = (stepId: string) => {
    setChecklists(prev => prev.map(cl => {
      if (cl.id !== activeChecklistId) return cl;
      return {
        ...cl,
        steps: cl.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s)
      };
    }));
    audioService.playRadarBlip();
  };

  const resetActiveChecklist = () => {
    setChecklists(prev => prev.map(cl => {
      if (cl.id !== activeChecklistId) return cl;
      return {
        ...cl,
        steps: cl.steps.map(s => ({ ...s, completed: false }))
      };
    }));
  };

  const completedSteps = activeChecklist.steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedSteps / activeChecklist.steps.length) * 100);

  return (
    <div className="p-4 rounded-2xl glass-panel space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-hud-amber" />
          <div>
            <h3 className="font-display font-bold text-base text-white">
              QUICK REFERENCE HANDBOOK (QRH) EMERGENCY PROCEDURES
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Cockpit Action Validation • Step-by-Step Abnormal Checklists
            </p>
          </div>
        </div>

        <button
          onClick={resetActiveChecklist}
          className="px-3 py-1.5 rounded-xl bg-aerospace-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Steps</span>
        </button>
      </div>

      {/* Checklist Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {checklists.map(cl => (
          <button
            key={cl.id}
            onClick={() => setActiveChecklistId(cl.id)}
            className={`px-3 py-2 rounded-xl text-left font-mono text-xs transition-all border ${
              cl.id === activeChecklistId
                ? 'bg-hud-amber/20 border-hud-amber text-hud-amber font-bold shadow-hud-glow-amber'
                : 'bg-aerospace-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[10px] text-slate-500">{cl.id}</div>
            <div className="text-white font-bold truncate max-w-xs">{cl.title}</div>
          </button>
        ))}
      </div>

      {/* Active Checklist Card */}
      <div className="p-4 rounded-xl bg-aerospace-900/90 border border-hud-amber/30 space-y-3 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div>
            <span className="text-[10px] text-hud-amber font-bold block">{activeChecklist.category}</span>
            <h4 className="text-sm font-bold text-white">{activeChecklist.title}</h4>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-[11px]">TRANSPONDER: <b className="text-hud-crimson">{activeChecklist.squawkCode}</b></span>
            <span className="text-slate-400 text-[11px]">PROGRESS: <b className="text-hud-emerald">{progressPercent}%</b></span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-hud-emerald transition-all duration-300 shadow-hud-glow-green"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="space-y-2 pt-1">
          {activeChecklist.steps.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                step.completed
                  ? 'bg-hud-emerald/10 border-hud-emerald/40 text-hud-emerald'
                  : 'bg-aerospace-950/80 border-slate-800 hover:border-hud-cyan/40 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-500 text-xs w-4">{idx + 1}.</span>
                <div>
                  <span className={`font-bold ${step.completed ? 'line-through opacity-75' : 'text-white'}`}>
                    {step.item}
                  </span>
                  <span className="text-slate-400 mx-2">........................................</span>
                  <span className={`font-bold ${step.completed ? 'text-hud-emerald' : 'text-hud-cyan'}`}>
                    {step.action}
                  </span>
                </div>
              </div>

              <div>
                {step.completed ? (
                  <CheckSquare className="w-5 h-5 text-hud-emerald" />
                ) : (
                  <Square className="w-5 h-5 text-slate-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        {progressPercent === 100 && (
          <div className="p-3 rounded-lg bg-hud-emerald/20 border border-hud-emerald/50 text-hud-emerald text-center font-bold text-xs animate-pulse">
            ✓ CHECKLIST COMPLETED — ALL EMERGENCY PROCEDURAL ITEMS EXECUTED
          </div>
        )}
      </div>
    </div>
  );
};
