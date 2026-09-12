import React, { useState } from 'react';
import { AircraftTelemetry, DatalinkMessage } from '../../types';
import { EnvironmentPanel } from './EnvironmentPanel';
import { RiskIntelligenceWidget } from './RiskIntelligenceWidget';
import { CockpitDigitalTwin } from './CockpitDigitalTwin';
import { HUDOverlay } from '../common/HUDOverlay';
import { CircularGauge } from '../common/TelemetryGauge';
import { DatalinkCommCenter } from '../Communications/DatalinkCommCenter';
import { RerouteIntelligenceModal } from '../AIReroute/RerouteIntelligenceModal';
import { AeroAIAssistant } from '../AeroAI/AeroAIAssistant';
import { MapContainer, TileLayer, Marker, Polyline, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { WEATHER_ADVISORIES } from '../../data/mockData';
import { 
  Compass, 
  Plane, 
  Sparkles, 
  AlertTriangle, 
  Activity, 
  Radio, 
  Bot, 
  Sliders, 
  Flame, 
  ShieldAlert, 
  CheckCircle2,
  Info 
} from 'lucide-react';

interface PilotCockpitViewProps {
  telemetry: AircraftTelemetry;
  datalinkMessages: DatalinkMessage[];
}

const createCockpitPlaneIcon = (heading: number, isDanger: boolean) => {
  const color = isDanger ? '#ff0055' : '#00ff88';
  const pulseClass = isDanger ? 'animate-plane-pulse' : '';
  const svgHtml = `
    <div class="${pulseClass}" style="transform: rotate(${heading}deg); transform-origin: center; filter: drop-shadow(0 0 10px ${color}); width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="#030712" stroke-width="1.2">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    </div>
  `;
  return L.divIcon({ html: svgHtml, className: 'cockpit-plane-icon', iconSize: [38, 38], iconAnchor: [19, 19] });
};

export const PilotCockpitView: React.FC<PilotCockpitViewProps> = ({
  telemetry,
  datalinkMessages
}) => {
  const [isRerouteOpen, setIsRerouteOpen] = useState<boolean>(false);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);

  const isDanger = telemetry.safetyStatus === 'DANGER';

  return (
    <div className="space-y-5 font-mono text-xs select-none">
      {/* Cockpit Top Glass Flight Deck Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-hud-cyan/40">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-hud-cyan/20 to-blue-800/40 border border-hud-cyan/40 text-hud-cyan shadow-hud-glow">
              <Plane className="w-6 h-6 transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-bold text-white tracking-wide">
                  FLIGHT DECK GLASS COCKPIT — {telemetry.flightNumber}
                </h1>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  isDanger ? 'bg-hud-crimson text-white animate-pulse shadow-hud-glow-red' : 'bg-hud-emerald/20 text-hud-emerald border border-hud-emerald/40'
                }`}>
                  STATUS: {telemetry.safetyStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {telemetry.model} • TAIL: <b className="text-white">{telemetry.tailNumber}</b> • ROUTE: <b className="text-hud-cyan">{telemetry.originIata} → {telemetry.destIata}</b> • SQUAWK: <b className={isDanger ? 'text-hud-crimson' : 'text-white'}>{telemetry.squawk}</b>
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isDanger && !telemetry.isRerouted && (
            <button
              onClick={() => setIsRerouteOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-hud-emerald to-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-hud-glow-green animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              <span>ENGAGE AI REROUTE OPTIMIZER →</span>
            </button>
          )}

          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              showAIAssistant
                ? 'bg-purple-600 text-white shadow-hud-glow'
                : 'bg-aerospace-900 border border-purple-500/40 text-purple-300 hover:bg-purple-900/30'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AEROAI COPILOT</span>
          </button>
        </div>
      </div>

      {/* Emergency Reroute Action Callout (if in Danger state) */}
      {isDanger && !telemetry.isRerouted && (
        <div className="p-4 rounded-2xl bg-hud-crimson/20 border border-hud-crimson text-white flex flex-wrap items-center justify-between gap-3 shadow-hud-glow-red animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-hud-crimson shrink-0" />
            <div>
              <div className="font-bold text-sm text-hud-crimson">
                CRITICAL HAZARD DETECTED: LEVEL 5 CONVECTIVE STORM CELL ACROSS ACTIVE HEADING
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Reason: Intersects FL480 supercell core & EGT thermal degradation • AI recommends immediate Northern Bypass Corridor outside red exclusion zone.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRerouteOpen(true)}
            className="px-4 py-2 rounded-xl bg-hud-emerald hover:bg-hud-emerald/90 text-black font-bold text-xs flex items-center gap-1.5 shadow-hud-glow-green"
          >
            <span>Authorize AI Bypass Route →</span>
          </button>
        </div>
      )}

      {/* Main Grid: Navigation Display (Left) & Live Environment Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Navigation Display (ND) showing ONLY active aircraft trajectory */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-4 rounded-2xl glass-panel space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-hud-cyan font-bold">
                <Compass className="w-4 h-4" />
                <span>ELECTRONIC NAVIGATION DISPLAY (ND) — {telemetry.flightNumber}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                POS: {telemetry.latitude.toFixed(2)}°, {telemetry.longitude.toFixed(2)}° • HDG: {telemetry.headingDeg.toFixed(0)}° • GS: {telemetry.groundSpeedKnots} kt • ALT: {telemetry.altitudeFt.toLocaleString()} ft
              </span>
            </div>

            {/* English-Only Dark World Map Layer (Zero Key Required) */}
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-800 bg-aerospace-950">
              <MapContainer
                center={[telemetry.latitude, telemetry.longitude]}
                zoom={5}
                className="w-full h-full"
                zoomControl={false}
              >
                {/* 100% Free OpenStreetMap Standard Layer (Zero API Key, Immediate Load) */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Hazard Polygons: Red = Danger (No-Fly), Yellow = Caution (Advisory) */}
                {WEATHER_ADVISORIES.map((adv) => {
                  const isDangerZone = adv.intensity === 'EXTREME' || adv.intensity === 'SEVERE';
                  const polyColor = isDangerZone ? '#ff0055' : '#ffb703';

                  return (
                    <Polygon
                      key={adv.id}
                      positions={adv.coordinates}
                      pathOptions={{
                        color: polyColor,
                        fillColor: polyColor,
                        fillOpacity: isDangerZone ? 0.35 : 0.22,
                        weight: isDangerZone ? 2.5 : 1.8,
                        dashArray: isDangerZone ? '5, 5' : '3, 3'
                      }}
                    />
                  );
                })}

                {/* Red Danger Zone Buffer */}
                {telemetry.activeDangerZone && (
                  <Circle
                    center={[telemetry.activeDangerZone.lat, telemetry.activeDangerZone.lon]}
                    radius={telemetry.activeDangerZone.radiusNm * 1852}
                    pathOptions={{
                      color: '#ff0055',
                      fillColor: '#ff0055',
                      fillOpacity: 0.25,
                      weight: 2,
                      dashArray: '4, 4'
                    }}
                  />
                )}

                {/* Red Route: Original Flight Plan */}
                {telemetry.originalRoute && telemetry.originalRoute.length > 0 && (
                  <Polyline
                    positions={telemetry.originalRoute}
                    pathOptions={{
                      color: '#ff0055',
                      weight: 3,
                      opacity: 0.85,
                      dashArray: '5, 5'
                    }}
                  />
                )}

                {/* Green Route: Active Optimized Flight Plan */}
                <Polyline
                  positions={telemetry.activeRoute}
                  pathOptions={{
                    color: telemetry.isRerouted ? '#00ff88' : '#00f0ff',
                    weight: 3.5,
                    opacity: 0.95
                  }}
                />

                {/* Blue Circle: Current Aircraft Position Pulse */}
                <Circle
                  center={[telemetry.latitude, telemetry.longitude]}
                  radius={12000}
                  pathOptions={{
                    color: '#00f0ff',
                    fillColor: '#00f0ff',
                    fillOpacity: 0.2,
                    weight: 2
                  }}
                />

                {/* Cockpit Plane Marker (Moving continuously in real-time) */}
                <Marker
                  position={[telemetry.latitude, telemetry.longitude]}
                  icon={createCockpitPlaneIcon(telemetry.headingDeg, isDanger && !telemetry.isRerouted)}
                />
              </MapContainer>

              {/* In-Map Visual Legend */}
              <div className="absolute bottom-3 left-3 z-[1000] bg-aerospace-900/95 border border-slate-800 rounded-xl p-2.5 backdrop-blur-md text-[10px] space-y-1 shadow-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-2 bg-hud-crimson/60 border border-hud-crimson rounded-sm" />
                  <span className="text-slate-200">Red Polygon = <b className="text-hud-crimson">Danger (No-Fly Exclusion)</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-2 bg-hud-amber/60 border border-hud-amber rounded-sm" />
                  <span className="text-slate-200">Yellow Polygon = <b className="text-hud-amber">Caution (Advisory Region)</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-hud-emerald rounded" />
                  <span className="text-slate-200">Green Route = <b className="text-hud-emerald">Active Optimized Corridor</b></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Weather & Atmospheric Metrics Panel */}
        <div className="lg:col-span-5">
          <EnvironmentPanel
            environment={telemetry.environment}
            flightNumber={telemetry.flightNumber}
          />
        </div>
      </div>

      {/* Grid: Primary Flight Display (PFD) HUD & Dual Engine Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* PFD HUD */}
        <div className="lg:col-span-5">
          <HUDOverlay telemetry={telemetry} />
        </div>

        {/* Dual Engine Gauges */}
        <div className="lg:col-span-7 p-4 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-hud-cyan font-bold">
              <Flame className="w-4 h-4" />
              <span>COCKPIT ENGINE INDICATION & CREW ALERTING SYSTEM (EICAS)</span>
            </div>
            <span className="text-[10px] text-slate-400">DUAL FADEC CHANNELS ACTIVE</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Engine 1 */}
            <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800 space-y-2">
              <span className="text-hud-emerald font-bold block text-[11px]">ENGINE #1 (PORT)</span>
              <div className="grid grid-cols-2 gap-2">
                <CircularGauge label="EGT" value={telemetry.engine1.egtDegC} min={300} max={950} unit="°C" warningThreshold={740} dangerThreshold={850} />
                <CircularGauge label="N2 RPM" value={telemetry.engine1.n2Percent} min={0} max={110} unit="%" warningThreshold={96} dangerThreshold={103} />
              </div>
              <div className="text-[10px] text-slate-400 pt-1">
                Fuel Flow: <b className="text-white">{telemetry.engine1.fuelFlowKgHr} kg/h</b> • Vib: <b className="text-hud-emerald">{telemetry.engine1.vibrationN2} mm/s</b>
              </div>
            </div>

            {/* Engine 2 */}
            <div className={`p-3 rounded-xl border space-y-2 ${
              telemetry.engine2.egtDegC > 750 ? 'bg-hud-crimson/10 border-hud-crimson/50' : 'bg-aerospace-900/80 border-slate-800'
            }`}>
              <span className={`font-bold block text-[11px] ${telemetry.engine2.egtDegC > 750 ? 'text-hud-crimson' : 'text-hud-emerald'}`}>
                ENGINE #2 (STARBOARD)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <CircularGauge label="EGT" value={telemetry.engine2.egtDegC} min={300} max={950} unit="°C" warningThreshold={740} dangerThreshold={850} />
                <CircularGauge label="N2 RPM" value={telemetry.engine2.n2Percent} min={0} max={110} unit="%" warningThreshold={96} dangerThreshold={103} />
              </div>
              <div className="text-[10px] text-slate-400 pt-1">
                Fuel Flow: <b className="text-white">{telemetry.engine2.fuelFlowKgHr} kg/h</b> • Vib: <b className={telemetry.engine2.vibrationN2 > 1.0 ? 'text-hud-crimson' : 'text-hud-emerald'}>{telemetry.engine2.vibrationN2} mm/s</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subsystems & Risk Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <CockpitDigitalTwin telemetry={telemetry} />
        </div>
        <div className="lg:col-span-5">
          <RiskIntelligenceWidget telemetry={telemetry} />
        </div>
      </div>

      {/* Pilot ↔ Tower CPDLC Datalink Communications */}
      <DatalinkCommCenter
        messages={datalinkMessages}
        activeAircraft={telemetry}
        mode="PILOT"
      />

      {/* AI Assistant Drawer / Modal */}
      {showAIAssistant && (
        <div className="p-4 rounded-2xl glass-panel">
          <AeroAIAssistant activeAircraft={telemetry} />
        </div>
      )}

      {/* AI Reroute Optimization Modal */}
      {isRerouteOpen && (
        <RerouteIntelligenceModal
          aircraft={telemetry}
          onClose={() => setIsRerouteOpen(false)}
        />
      )}
    </div>
  );
};
