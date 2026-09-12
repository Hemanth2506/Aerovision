import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { AircraftTelemetry, WeatherAdvisory } from '../../types';
import { WEATHER_ADVISORIES } from '../../data/mockData';
import { Plane, Eye, Layers, ShieldAlert, Navigation } from 'lucide-react';

interface FleetRadarMapProps {
  fleet: AircraftTelemetry[];
  activeAircraft: AircraftTelemetry;
  onSelectAircraft: (aircraftId: string) => void;
}

// Function to create custom SVG plane icon rotated to heading
const createPlaneIcon = (heading: number, isSelected: boolean, healthScore: number) => {
  const color = healthScore < 80 ? '#ffb703' : isSelected ? '#00f0ff' : '#00ff88';
  const glow = isSelected ? 'drop-shadow(0 0 8px #00f0ff)' : 'drop-shadow(0 0 3px ' + color + ')';
  
  const svgHtml = `
    <div style="transform: rotate(${heading}deg); transform-origin: center; filter: ${glow}; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="${color}" stroke="#030712" stroke-width="1">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-plane-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export const FleetRadarMap: React.FC<FleetRadarMapProps> = ({
  fleet,
  activeAircraft,
  onSelectAircraft
}) => {
  const [showWeather, setShowWeather] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showDiversionRings, setShowDiversionRings] = useState<boolean>(true);

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-hud-cyan/30 shadow-2xl bg-aerospace-950">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-aerospace-900/90 border border-hud-cyan/30 rounded-xl p-1.5 backdrop-blur-md text-xs font-mono">
        <span className="px-2 text-hud-cyan font-bold flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          RADAR LAYERS:
        </span>
        <button
          onClick={() => setShowRoutes(!showRoutes)}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            showRoutes ? 'bg-hud-cyan/20 border border-hud-cyan/40 text-hud-cyan font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Flight Paths
        </button>
        <button
          onClick={() => setShowWeather(!showWeather)}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            showWeather ? 'bg-hud-amber/20 border border-hud-amber/40 text-hud-amber font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          SIGMET Storms
        </button>
        <button
          onClick={() => setShowDiversionRings(!showDiversionRings)}
          className={`px-2.5 py-1 rounded-lg transition-colors ${
            showDiversionRings ? 'bg-hud-emerald/20 border border-hud-emerald/40 text-hud-emerald font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          120nm Diversion Rings
        </button>
      </div>

      {/* Radar Sweep HUD line effect */}
      <div className="absolute inset-0 pointer-events-none z-[900] overflow-hidden opacity-30">
        <div className="w-full h-full radar-grid" />
      </div>

      {/* Real-time Fleet Counter Badge */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-aerospace-900/90 border border-hud-cyan/30 rounded-xl px-3 py-2 backdrop-blur-md text-xs font-mono flex items-center gap-4">
        <div>
          <span className="text-slate-400 text-[10px] block">AIRBORNE FLEET</span>
          <span className="text-hud-cyan font-bold text-sm">{fleet.length} Aircraft</span>
        </div>
        <div className="h-6 w-px bg-slate-800" />
        <div>
          <span className="text-slate-400 text-[10px] block">MONITORED TARGET</span>
          <span className="text-hud-emerald font-bold text-sm">{activeAircraft.flightNumber}</span>
        </div>
        <div className="h-6 w-px bg-slate-800" />
        <div>
          <span className="text-slate-400 text-[10px] block">ALTITUDE / GS</span>
          <span className="text-white font-mono text-sm">FL{(activeAircraft.altitudeFt/100).toFixed(0)} • {activeAircraft.groundSpeedKnots}kt</span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <MapContainer
        center={[35, 10]}
        zoom={2}
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

        {/* Hazard Polygons: Red = Danger (Severe/Extreme), Yellow = Caution (Moderate) */}
        {showWeather && WEATHER_ADVISORIES.map((adv) => {
          const isDangerZone = adv.intensity === 'SEVERE' || adv.intensity === 'EXTREME';
          const polyColor = isDangerZone ? '#ff0055' : '#ffb703';

          return (
            <Polygon
              key={adv.id}
              positions={adv.coordinates}
              pathOptions={{
                color: polyColor,
                fillColor: polyColor,
                fillOpacity: isDangerZone ? 0.32 : 0.22,
                weight: isDangerZone ? 2.2 : 1.6,
                dashArray: isDangerZone ? '5, 5' : '3, 3'
              }}
            >
              <Popup>
                <div className="text-xs font-mono p-1">
                  <div className={`font-bold ${isDangerZone ? 'text-hud-crimson' : 'text-hud-amber'}`}>
                    {adv.id} — {isDangerZone ? 'RED NO-FLY DANGER ZONE' : 'YELLOW CAUTION ZONE'}
                  </div>
                  <div className="text-slate-300 font-semibold mt-1">{adv.region}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{adv.description}</div>
                  <div className={`text-[10px] mt-1 font-bold ${isDangerZone ? 'text-hud-crimson' : 'text-hud-amber'}`}>
                    ALT: {adv.altitudeRange} • STATUS: {isDangerZone ? 'ABSOLUTE EXCLUSION' : 'TRANSIT PERMITTED WITH CAUTION'}
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Flight Route Lines & Diversion Circles */}
        {fleet.map((ac) => {
          const isSelected = ac.aircraftId === activeAircraft.aircraftId;

          return (
            <React.Fragment key={`routes-${ac.aircraftId}`}>
              {/* Route Vector Line */}
              {showRoutes && (
                <Polyline
                  positions={[
                    [ac.latitude - Math.cos((ac.headingDeg * Math.PI)/180)*6, ac.longitude - Math.sin((ac.headingDeg * Math.PI)/180)*6],
                    [ac.latitude, ac.longitude],
                    [ac.latitude + Math.cos((ac.headingDeg * Math.PI)/180)*12, ac.longitude + Math.sin((ac.headingDeg * Math.PI)/180)*12]
                  ]}
                  pathOptions={{
                    color: isSelected ? '#00f0ff' : '#00ff88',
                    weight: isSelected ? 2.5 : 1.2,
                    opacity: isSelected ? 0.85 : 0.35,
                    dashArray: isSelected ? undefined : '6, 6'
                  }}
                />
              )}

              {/* 120 NM ETOPS / Diversion Range Ring for Selected Aircraft */}
              {showDiversionRings && isSelected && (
                <Circle
                  center={[ac.latitude, ac.longitude]}
                  radius={222240} // 120 Nautical Miles in meters
                  pathOptions={{
                    color: '#00f0ff',
                    fillColor: '#00f0ff',
                    fillOpacity: 0.05,
                    weight: 1,
                    dashArray: '5, 5'
                  }}
                />
              )}

              {/* Aircraft Marker */}
              <Marker
                position={[ac.latitude, ac.longitude]}
                icon={createPlaneIcon(ac.headingDeg, isSelected, ac.overallHealthScore)}
                eventHandlers={{
                  click: () => onSelectAircraft(ac.aircraftId)
                }}
              >
                <Popup>
                  <div className="text-xs font-mono p-1">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
                      <span className="font-bold text-hud-cyan text-sm">{ac.flightNumber}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                        ac.overallHealthScore > 85 ? 'bg-hud-emerald/20 text-hud-emerald' : 'bg-hud-amber/20 text-hud-amber'
                      }`}>
                        {ac.overallHealthScore}% HEALTH
                      </span>
                    </div>
                    <div className="text-slate-300 font-medium">{ac.model} ({ac.tailNumber})</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{ac.originIata} → {ac.destIata}</div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t border-slate-800 text-[10px]">
                      <div>
                        <span className="text-slate-500 block">ALTITUDE:</span>
                        <span className="text-white font-bold">{ac.altitudeFt.toLocaleString()} FT</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">GROUND SPEED:</span>
                        <span className="text-white font-bold">{ac.groundSpeedKnots} KTS</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">HEADING:</span>
                        <span className="text-white font-bold">{ac.headingDeg.toFixed(0)}°</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">FUEL ONBOARD:</span>
                        <span className="text-white font-bold">{ac.fuel.totalQuantityKg.toLocaleString()} KG</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectAircraft(ac.aircraftId)}
                      className="w-full mt-2 py-1 rounded bg-hud-cyan/20 border border-hud-cyan/50 text-hud-cyan hover:bg-hud-cyan/30 text-center font-bold text-[11px] transition-colors"
                    >
                      Inspect Telemetry & Twin →
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
