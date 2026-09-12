import React, { useState } from 'react';
import { WEATHER_ADVISORIES } from '../../data/mockData';
import { CloudSun, Wind, AlertTriangle, Eye, Compass, Droplet, Thermometer } from 'lucide-react';

export const WeatherIntelligenceCenter: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<string>('KJFK');
  const [runwayHeading, setRunwayHeading] = useState<number>(44); // RWY 04L JFK
  const [windDir, setWindDir] = useState<number>(80);
  const [windSpeed, setWindSpeed] = useState<number>(14);

  // Crosswind calculation
  const angleDiff = Math.abs((windDir - runwayHeading) * (Math.PI / 180));
  const crosswindKnots = Math.round(Math.abs(windSpeed * Math.sin(angleDiff)));
  const headwindKnots = Math.round(windSpeed * Math.cos(angleDiff));

  const metarStations = [
    { code: 'KJFK', name: 'New York JFK', metar: 'KJFK 281451Z 08014KT 10SM SCT045 BKN250 24/16 A3002 RMK AO2 SLP164', taf: 'TAF KJFK 281120Z 2812/2918 08012KT P6SM FEW040 BKN250', temp: 24, vis: '10 SM', category: 'VFR' },
    { code: 'EGLL', name: 'London Heathrow', metar: 'EGLL 281450Z 26018G26KT 9999 FEW030 SCT048 21/13 Q1015 NOSIG', taf: 'TAF EGLL 281100Z 2812/2918 26017KT 9999 SCT035 TEMPO 2815/2820 26022G32KT', temp: 21, vis: '10+ KM', category: 'VFR' },
    { code: 'WSSS', name: 'Singapore Changi', metar: 'WSSS 281430Z 04009KT 9999 FEW018CB BKN140 30/25 Q1008 TEMPO 4000 TSRA', taf: 'TAF WSSS 281100Z 2812/2918 05008KT 9999 SCT020 TEMPO 2814/2818 3000 +TSRA', temp: 30, vis: '9999 M', category: 'MVFR' },
    { code: 'OMDB', name: 'Dubai Intl', metar: 'OMDB 281400Z 33012KT 8000 NSC 38/22 Q1004 CAVOK', taf: 'TAF OMDB 281100Z 2812/2918 33012KT 9999 NSC CAVOK', temp: 38, vis: '8000 M', category: 'VFR' }
  ];

  const currentStation = metarStations.find(s => s.code === selectedStation) || metarStations[0];

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 shadow-hud-glow">
              <CloudSun className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                GLOBAL WEATHER & TURBULENCE INTELLIGENCE
              </h1>
              <p className="text-xs text-slate-400">
                Oceanic Jet Stream Tracking • Automated METAR/TAF Decoding • SIGMET Convective Cell Alerts
              </p>
            </div>
          </div>
        </div>

        {/* Station Selector */}
        <div className="flex items-center gap-1.5 bg-aerospace-900/90 border border-slate-800 rounded-xl p-1">
          {metarStations.map(st => (
            <button
              key={st.code}
              onClick={() => setSelectedStation(st.code)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                st.code === selectedStation
                  ? 'bg-sky-500/30 border border-sky-400 text-hud-cyan font-bold shadow-hud-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st.code}
            </button>
          ))}
        </div>
      </div>

      {/* METAR / TAF Decoded Card */}
      <div className="p-4 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] text-sky-400 font-bold block">{currentStation.code} — {currentStation.name}</span>
            <h3 className="font-display font-bold text-base text-white">OFFICIAL AVIATION METEOROLOGICAL REPORT</h3>
          </div>
          <span className="px-3 py-1 rounded bg-hud-emerald/20 border border-hud-emerald/40 text-hud-emerald font-bold">
            FLIGHT CATEGORY: {currentStation.category}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">SURFACE TEMP / DEWPOINT:</span>
            <span className="text-base font-bold text-white mt-1 block">{currentStation.temp}°C</span>
          </div>
          <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">FLIGHT VISIBILITY:</span>
            <span className="text-base font-bold text-hud-emerald mt-1 block">{currentStation.vis}</span>
          </div>
          <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">ALTIMETER / QNH:</span>
            <span className="text-base font-bold text-hud-cyan mt-1 block">30.02 inHg / 1016 hPa</span>
          </div>
          <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">CLOUD CEILING:</span>
            <span className="text-base font-bold text-white mt-1 block">SCT 4,500 ft (Unlimited)</span>
          </div>
        </div>

        {/* METAR & TAF String Boxes */}
        <div className="space-y-2 pt-2">
          <div className="p-3 rounded-xl bg-aerospace-950/90 border border-slate-800">
            <span className="text-[10px] text-hud-cyan font-bold block mb-1">RAW METAR TRANSMISSION</span>
            <code className="text-xs text-slate-200">{currentStation.metar}</code>
          </div>
          <div className="p-3 rounded-xl bg-aerospace-950/90 border border-slate-800">
            <span className="text-[10px] text-sky-400 font-bold block mb-1">TERMINAL AERODROME FORECAST (TAF 24H)</span>
            <code className="text-xs text-slate-200">{currentStation.taf}</code>
          </div>
        </div>
      </div>

      {/* Crosswind Calculator & SIGMET Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Crosswind Calculator */}
        <div className="lg:col-span-6 p-4 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-base text-white border-b border-slate-800 pb-3">
            <Compass className="w-5 h-5 text-hud-cyan" />
            <span>INTERACTIVE RUNWAY CROSSWIND CALCULATOR</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">RWY HEADING (°)</label>
              <input
                type="number"
                value={runwayHeading}
                onChange={(e) => setRunwayHeading(Number(e.target.value))}
                className="w-full p-2 rounded bg-aerospace-950 border border-slate-700 text-white focus:outline-none focus:border-hud-cyan font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">WIND DIR (°)</label>
              <input
                type="number"
                value={windDir}
                onChange={(e) => setWindDir(Number(e.target.value))}
                className="w-full p-2 rounded bg-aerospace-950 border border-slate-700 text-white focus:outline-none focus:border-hud-cyan font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">WIND SPEED (KT)</label>
              <input
                type="number"
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className="w-full p-2 rounded bg-aerospace-950 border border-slate-700 text-white focus:outline-none focus:border-hud-cyan font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">CROSSWIND COMPONENT:</span>
              <span className={`text-xl font-bold ${crosswindKnots > 25 ? 'text-hud-crimson' : 'text-hud-emerald'}`}>
                {crosswindKnots} Knots {crosswindKnots > 0 ? (windDir > runwayHeading ? 'Right' : 'Left') : ''}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Max Dry Limit: 38 kts</span>
            </div>
            <div className="p-3 rounded-xl bg-aerospace-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">HEADWIND / TAILWIND:</span>
              <span className={`text-xl font-bold ${headwindKnots >= 0 ? 'text-hud-cyan' : 'text-hud-amber'}`}>
                {headwindKnots >= 0 ? `${headwindKnots} kt Headwind` : `${Math.abs(headwindKnots)} kt Tailwind`}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Max Tailwind: 15 kts</span>
            </div>
          </div>
        </div>

        {/* SIGMET Active Advisories */}
        <div className="lg:col-span-6 p-4 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-base text-white border-b border-slate-800 pb-3">
            <AlertTriangle className="w-5 h-5 text-hud-amber" />
            <span>ACTIVE SIGMET & SEVERE TURBULENCE BULLETINS</span>
          </div>

          <div className="space-y-3">
            {WEATHER_ADVISORIES.map((adv) => (
              <div
                key={adv.id}
                className="p-3 rounded-xl bg-aerospace-900/80 border border-hud-amber/30 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-hud-amber">{adv.id} — {adv.region}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-hud-crimson/20 text-hud-crimson font-bold">
                    {adv.intensity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{adv.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>ALTITUDE: {adv.altitudeRange}</span>
                  <span>VALID UNTIL: {new Date(adv.validUntil).toUTCString().substring(17, 22)} UTC</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
