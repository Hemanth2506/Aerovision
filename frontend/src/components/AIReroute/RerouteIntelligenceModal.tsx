import React, { useState } from 'react';
import { AircraftTelemetry, RouteOption } from '../../types';
import { telemetryEngine } from '../../services/telemetryEngine';
import { 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Leaf, 
  Compass, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Radio 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RerouteIntelligenceModalProps {
  aircraft: AircraftTelemetry;
  onClose: () => void;
}

export const RerouteIntelligenceModal: React.FC<RerouteIntelligenceModalProps> = ({
  aircraft,
  onClose
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('RO-SAFEST');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(aircraft.isRerouted);

  const options: RouteOption[] = aircraft.rerouteOptions || [
    {
      id: 'RO-SAFEST',
      name: 'AI Northern Storm Bypass Corridor (Recommended)',
      type: 'SAFEST',
      waypoints: [[14.85, 81.34], [16.8, 87.2], [11.5, 94.8], [5.2, 99.4], [1.36, 103.99]],
      distanceNm: 1840,
      estimatedTimeMin: 205,
      fuelBurnKg: 11200,
      co2EmissionsKg: 35392,
      riskScore: 14,
      description: 'Complete 68 NM clearance around convective storm cell. Zero severe turbulence encounters.',
      isRecommended: true
    },
    {
      id: 'RO-FASTEST',
      name: 'Southern High-Speed Jet Corridor',
      type: 'SHORTEST_DELAY',
      waypoints: [[14.85, 81.34], [10.2, 84.8], [6.8, 93.0], [1.36, 103.99]],
      distanceNm: 1780,
      estimatedTimeMin: 194,
      fuelBurnKg: 11950,
      co2EmissionsKg: 37762,
      riskScore: 38,
      description: 'Minimizes flight delay by 11 minutes; skims moderate turbulence boundary.'
    },
    {
      id: 'RO-ECO',
      name: 'Step-Climb Fuel-Efficient Path',
      type: 'FUEL_EFFICIENT',
      waypoints: [[14.85, 81.34], [15.2, 88.0], [8.0, 95.0], [1.36, 103.99]],
      distanceNm: 1810,
      estimatedTimeMin: 200,
      fuelBurnKg: 10650,
      co2EmissionsKg: 33654,
      riskScore: 22,
      description: 'Utilizes favorable 54 kt tailwind, saving 550 kg Jet-A1.'
    }
  ];

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      telemetryEngine.executeReroute(aircraft.aircraftId, selectedOptionId);
      setIsExecuting(false);
      setIsDone(true);
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.7 } });
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[2000] font-mono select-none">
      <div className="w-full max-w-4xl bg-aerospace-950 border border-hud-cyan/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-aerospace-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-hud-emerald/20 border border-hud-emerald/40 text-hud-emerald shadow-hud-glow-green">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-white">
                  AI DYNAMIC ROUTE OPTIMIZATION & CLEARANCE ENGINE
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-hud-crimson/20 border border-hud-crimson/50 text-hud-crimson font-bold animate-pulse">
                  DANGER INTERVENTION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Airframe: <b className="text-white">{aircraft.flightNumber} ({aircraft.model})</b> • Tail: {aircraft.tailNumber} • Route: {aircraft.originIata} → {aircraft.destIata}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Threat Detection Banner */}
          <div className="p-3.5 rounded-xl bg-hud-crimson/15 border border-hud-crimson/40 text-slate-200 flex items-start gap-3 shadow-hud-glow-red">
            <AlertTriangle className="w-5 h-5 text-hud-crimson shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-hud-crimson text-sm">
                PRIMARY THREAT SOURCE IDENTIFIED: {aircraft.activeDangerZone?.hazardType || 'Severe Supercell Storm Cell (FL480)'}
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Active route segment intersects high-intensity convective thunderstorm cell with tops exceeding FL480, extreme turbulence (EDR 0.88), microburst wind shear, and severe airframe icing.
              </p>
            </div>
          </div>

          {/* AI Calculated Alternative Corridors */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
              <span>SELECT OPTIMAL REROUTE TRAJECTORY:</span>
              <span className="text-hud-cyan font-normal">Autonomous Machine Learning Optimization</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {options.map((opt) => {
                const isSelected = opt.id === selectedOptionId;

                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-hud-emerald/15 border-hud-emerald shadow-hud-glow-green text-white'
                        : 'bg-aerospace-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          opt.type === 'SAFEST' ? 'bg-hud-emerald/20 text-hud-emerald' : opt.type === 'SHORTEST_DELAY' ? 'bg-hud-cyan/20 text-hud-cyan' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {opt.type.replace('_', ' ')}
                        </span>
                        {opt.isRecommended && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-hud-emerald text-black font-bold">
                            RECOMMENDED
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-white mb-2">{opt.name}</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed mb-3">{opt.description}</p>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">POST-REROUTE RISK:</span>
                        <span className="text-hud-emerald font-bold">{opt.riskScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">EST. FLIGHT TIME:</span>
                        <span className="text-white font-bold">{opt.estimatedTimeMin} Mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">FUEL CONSUMPTION:</span>
                        <span className="text-hud-cyan font-bold">{opt.fuelBurnKg.toLocaleString()} KG</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Route Corridor Legend */}
          <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-hud-crimson rounded" />
                <span className="text-slate-400">Original Route (DANGER)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-hud-emerald rounded" />
                <span className="text-slate-400">AI Optimized Corridor (SAFE)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-hud-crimson/30 border border-hud-crimson" />
                <span className="text-slate-400">Threat Danger Zone</span>
              </div>
            </div>
            <span className="text-slate-500 text-[10px]">ICAO Doc 9613 PBN RNAV-1 Certified</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-aerospace-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Radio className="w-4 h-4 text-hud-emerald animate-pulse" />
            <span>Direct CPDLC Datalink Broadcast to Cockpit & ATC Sector</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              disabled={isExecuting || isDone}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-hud-emerald to-emerald-400 hover:from-hud-emerald hover:to-emerald-300 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-hud-glow-green disabled:opacity-50"
            >
              {isDone ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>REROUTE EXECUTED SUCCESSFULLY</span>
                </>
              ) : isExecuting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>EXECUTING DYNAMIC CLEARANCE...</span>
                </>
              ) : (
                <>
                  <span>AUTHORIZE & EXECUTE AI REROUTING</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
