import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { AircraftTelemetry } from '../../types';
import { WEATHER_ADVISORIES } from '../../data/mockData';
import { 
  Radar, 
  Layers, 
  ShieldAlert, 
  Flame, 
  Compass, 
  Navigation, 
  AlertTriangle, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

interface AirspaceRadarMapProps {
  fleet: AircraftTelemetry[];
  activeAircraft: AircraftTelemetry;
  onSelectAircraft: (aircraftId: string) => void;
  onTriggerRerouteModal?: (aircraft: AircraftTelemetry) => void;
}

// Function to create custom SVG plane icon rotated to heading with status colors
const createPlaneIcon = (heading: number, isSelected: boolean, status: 'SAFE' | 'CAUTION' | 'DANGER') => {
  const color = status === 'DANGER' ? '#ff0055' : status === 'CAUTION' ? '#ffb703' : '#00ff88';
  const glow = isSelected ? 'drop-shadow(0 0 10px #00f0ff)' : status === 'DANGER' ? 'drop-shadow(0 0 8px #ff0055)' : 'drop-shadow(0 0 3px ' + color + ')';
  const pulseClass = status === 'DANGER' ? 'animate-plane-pulse' : '';

  const svgHtml = `
    <div class="${pulseClass}" style="transform: rotate(${heading}deg); transform-origin: center; filter: ${glow}; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="${color}" stroke="#030712" stroke-width="1.2">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-atc-plane-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

export const AirspaceRadarMap: React.FC<AirspaceRadarMapProps> = ({
  fleet,
  activeAircraft,
  onSelectAircraft,
  onTriggerRerouteModal
}) => {
  const [showStorms, setShowStorms] = useState<boolean>(true);
  const [showReroutes, setShowReroutes] = useState<boolean>(true);
  const [showSeparationBuffers, setShowSeparationBuffers] = useState<boolean>(true);

  const dangerCount = fleet.filter(a => a.safetyStatus === 'DANGER').length;
  const cautionCount = fleet.filter(a => a.safetyStatus === 'CAUTION').length;
  const safeCount = fleet.filter(a => a.safetyStatus === 'SAFE').length;

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-hud-cyan/30 shadow-2xl bg-aerospace-950 font-mono select-none">
      {/* Top Tactical Radar Control Header */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 bg-aerospace-900/95 border border-hud-cyan/40 rounded-xl p-2 backdrop-blur-xl text-xs shadow-2xl">
        <div className="flex items-center gap-2 pr-2 border-r border-slate-700 font-bold text-hud-cyan">
          <Radar className="w-4 h-4 text-hud-cyan animate-pulse" />
          <span>FAA / ATC AIRSPACE RADAR</span>
        </div>

        <button
          onClick={() => setShowStorms(!showStorms)}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            showStorms ? 'bg-hud-crimson/20 border border-hud-crimson/50 text-hud-crimson font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          🛑 Danger & Caution Sectors
        </button>
        <button
          onClick={() => setShowReroutes(!showReroutes)}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            showReroutes ? 'bg-hud-emerald/20 border border-hud-emerald/50 text-hud-emerald font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          🌿 Green Safe Corridors
        </button>
        <button
          onClick={() => setShowSeparationBuffers(!showSeparationBuffers)}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            showSeparationBuffers ? 'bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          ⌖ 5NM Separation Rings
        </button>
      </div>

      {/* Top Right Live Fleet Tally */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-aerospace-900/95 border border-slate-800 rounded-xl p-2 backdrop-blur-xl text-xs">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-hud-emerald/10 border border-hud-emerald/30 text-hud-emerald font-bold">
          <span className="w-2 h-2 rounded-full bg-hud-emerald" />
          <span>{safeCount} SAFE</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-hud-amber/10 border border-hud-amber/30 text-hud-amber font-bold">
          <span className="w-2 h-2 rounded-full bg-hud-amber" />
          <span>{cautionCount} CAUTION</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-hud-crimson/20 border border-hud-crimson/50 text-hud-crimson font-bold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-hud-crimson" />
          <span>{dangerCount} DANGER</span>
        </div>
      </div>

      {/* Tactical HUD Scanline & Crosshairs Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[900] overflow-hidden opacity-25">
        <div className="w-full h-full radar-grid" />
      </div>

      {/* English-Only Dark World Map Layer (100% English Global Labels, Zero Key Required) */}
      <MapContainer
        center={[22, 55]}
        zoom={3}
        minZoom={2}
        maxZoom={12}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* 100% Free OpenStreetMap Standard Layer (Zero API Key, Immediate Load) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hazard Polygons: RED = DANGER (Extreme/Severe), YELLOW = CAUTION (Moderate) */}
        {showStorms && WEATHER_ADVISORIES.map((adv) => {
          const isDangerZone = adv.intensity === 'EXTREME' || adv.intensity === 'SEVERE';
          const polygonColor = isDangerZone ? '#ff0055' : '#ffb703';

          return (
            <Polygon
              key={adv.id}
              positions={adv.coordinates}
              pathOptions={{
                color: polygonColor,
                fillColor: polygonColor,
                fillOpacity: isDangerZone ? 0.32 : 0.22,
                weight: isDangerZone ? 2.5 : 1.8,
                dashArray: isDangerZone ? '5, 5' : '3, 3'
              }}
            >
              <Popup>
                <div className="text-xs font-mono p-1">
                  <div className={`font-bold text-sm flex items-center gap-1 ${isDangerZone ? 'text-hud-crimson' : 'text-hud-amber'}`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>{adv.id} — {isDangerZone ? 'RED NO-FLY DANGER ZONE' : 'YELLOW CAUTION ZONE'}</span>
                  </div>
                  <div className="text-slate-200 font-bold mt-1">{adv.region}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5 leading-tight">{adv.description}</div>
                  <div className={`text-[10px] mt-1.5 font-bold ${isDangerZone ? 'text-hud-crimson' : 'text-hud-amber'}`}>
                    ALTITUDE: {adv.altitudeRange} • STATUS: {isDangerZone ? 'ABSOLUTE EXCLUSION' : 'TRANSIT PERMITTED WITH CAUTION'}
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Render Aircraft Flight Paths, Danger Buffers & Green AI Corridors */}
        {fleet.map((ac) => {
          const isSelected = ac.aircraftId === activeAircraft.aircraftId;
          const isDanger = ac.safetyStatus === 'DANGER';

          return (
            <React.Fragment key={`atc-route-${ac.aircraftId}`}>
              {/* Active Danger Zone Buffer Circle (RED) */}
              {showStorms && ac.activeDangerZone && (
                <Circle
                  center={[ac.activeDangerZone.lat, ac.activeDangerZone.lon]}
                  radius={ac.activeDangerZone.radiusNm * 1852}
                  pathOptions={{
                    color: '#ff0055',
                    fillColor: '#ff0055',
                    fillOpacity: 0.25,
                    weight: 2,
                    dashArray: '4, 4'
                  }}
                />
              )}

              {/* Original Route (Red if dangerous/rerouted) */}
              {ac.originalRoute && ac.originalRoute.length > 0 && (
                <Polyline
                  positions={ac.originalRoute}
                  pathOptions={{
                    color: '#ff0055',
                    weight: 2,
                    opacity: 0.7,
                    dashArray: '4, 4'
                  }}
                />
              )}

              {/* Active Flight Route (Green if optimized/safe, Cyan if nominal selected) */}
              <Polyline
                positions={ac.activeRoute}
                pathOptions={{
                  color: ac.isRerouted ? '#00ff88' : isSelected ? '#00f0ff' : '#00ff88',
                  weight: isSelected ? 3.5 : 1.8,
                  opacity: isSelected ? 0.95 : 0.55
                }}
              />

              {/* 5 Nautical Mile ICAO Airspace Separation Buffer */}
              {showSeparationBuffers && isSelected && (
                <Circle
                  center={[ac.latitude, ac.longitude]}
                  radius={9260} // 5 NM in meters
                  pathOptions={{
                    color: '#00f0ff',
                    fillColor: '#00f0ff',
                    fillOpacity: 0.1,
                    weight: 1.5
                  }}
                />
              )}

              {/* Aircraft Radar Target Marker (Smooth continuous movement along route) */}
              <Marker
                position={[ac.latitude, ac.longitude]}
                icon={createPlaneIcon(ac.headingDeg, isSelected, ac.safetyStatus)}
                eventHandlers={{
                  click: () => onSelectAircraft(ac.aircraftId)
                }}
              >
                <Popup>
                  <div className="text-xs font-mono p-1">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
                      <span className="font-bold text-hud-cyan text-sm">{ac.flightNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        ac.safetyStatus === 'DANGER'
                          ? 'bg-hud-crimson text-white animate-pulse'
                          : ac.safetyStatus === 'CAUTION'
                          ? 'bg-hud-amber/20 text-hud-amber'
                          : 'bg-hud-emerald/20 text-hud-emerald'
                      }`}>
                        STATUS: {ac.safetyStatus}
                      </span>
                    </div>

                    <div className="text-slate-200 font-bold">{ac.model} ({ac.tailNumber})</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{ac.originIata} → {ac.destIata} | SQWK {ac.squawk}</div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">ALTITUDE / GS:</span>
                        <span className="text-white font-bold">FL{(ac.altitudeFt/100).toFixed(0)} • {ac.groundSpeedKnots} kts</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">RISK SCORE:</span>
                        <span className={`font-bold ${ac.riskScore > 50 ? 'text-hud-crimson' : 'text-hud-emerald'}`}>
                          {ac.riskScore}/100 ({ac.riskCategory})
                        </span>
                      </div>
                    </div>

                    {isDanger && !ac.isRerouted && onTriggerRerouteModal && (
                      <button
                        onClick={() => onTriggerRerouteModal(ac)}
                        className="w-full mt-2.5 py-1.5 rounded-lg bg-hud-emerald hover:bg-hud-emerald/90 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-hud-glow-green animate-pulse"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>ENGAGE AI REROUTE OPTIMIZER →</span>
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Visual Hazard Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-aerospace-900/95 border border-slate-800 rounded-xl p-2.5 backdrop-blur-xl text-[11px] space-y-1.5 shadow-2xl">
        <div className="text-slate-400 text-[10px] font-bold pb-1 border-b border-slate-800 flex items-center gap-1">
          <Info className="w-3 h-3 text-hud-cyan" />
          <span>AIRSPACE HAZARD CLASSIFICATION</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-hud-crimson/60 border border-hud-crimson inline-block" />
          <span className="text-slate-200">Red Polygon = <b className="text-hud-crimson">DANGER (No-Fly Exclusion Zone)</b></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-hud-amber/60 border border-hud-amber inline-block" />
          <span className="text-slate-200">Yellow Polygon = <b className="text-hud-amber">CAUTION (Moderate Advisory Zone)</b></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 rounded bg-hud-emerald inline-block" />
          <span className="text-slate-200">Green Route = <b className="text-hud-emerald">SAFE (Active Optimized Corridor)</b></span>
        </div>
      </div>
    </div>
  );
};
