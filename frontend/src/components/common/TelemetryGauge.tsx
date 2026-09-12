import React from 'react';

interface CircularGaugeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  warningThreshold?: number;
  dangerThreshold?: number;
  reverseWarning?: boolean; // If low value is dangerous (e.g. oil pressure or hydraulic pressure)
  size?: number;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  label,
  value,
  min,
  max,
  unit,
  warningThreshold,
  dangerThreshold,
  reverseWarning = false,
  size = 110
}) => {
  const radius = size * 0.38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((Math.min(Math.max(value, min), max) - min) / (max - min)) * (circumference * 0.75);

  let statusColor = 'text-hud-cyan stroke-hud-cyan';
  let glowColor = 'drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]';

  if (!reverseWarning) {
    if (dangerThreshold !== undefined && value >= dangerThreshold) {
      statusColor = 'text-hud-crimson stroke-hud-crimson';
      glowColor = 'drop-shadow-[0_0_10px_rgba(255,0,85,0.8)]';
    } else if (warningThreshold !== undefined && value >= warningThreshold) {
      statusColor = 'text-hud-amber stroke-hud-amber';
      glowColor = 'drop-shadow-[0_0_8px_rgba(255,183,3,0.7)]';
    }
  } else {
    if (dangerThreshold !== undefined && value <= dangerThreshold) {
      statusColor = 'text-hud-crimson stroke-hud-crimson';
      glowColor = 'drop-shadow-[0_0_10px_rgba(255,0,85,0.8)]';
    } else if (warningThreshold !== undefined && value <= warningThreshold) {
      statusColor = 'text-hud-amber stroke-hud-amber';
      glowColor = 'drop-shadow-[0_0_8px_rgba(255,183,3,0.7)]';
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-aerospace-900/60 border border-slate-800/80 hover:border-hud-cyan/30 transition-all">
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 text-center font-medium">
        {label}
      </div>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.85 }}>
        <svg className="transform -rotate-[135deg]" width={size} height={size}>
          {/* Background Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            className="text-slate-800"
            strokeLinecap="round"
          />
          {/* Active Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            className={`${statusColor} ${glowColor} transition-all duration-300`}
            strokeLinecap="round"
          />
        </svg>

        {/* Value Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="font-mono font-bold text-base tracking-tight text-white">
            {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
          </span>
          <span className="text-[10px] font-mono text-slate-400 font-medium">{unit}</span>
        </div>
      </div>

      <div className="w-full flex justify-between px-2 text-[9px] font-mono text-slate-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

interface LinearBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  warningThreshold?: number;
}

export const LinearBarGauge: React.FC<LinearBarProps> = ({
  label,
  value,
  max,
  unit,
  warningThreshold
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const isWarning = warningThreshold && percent >= warningThreshold;

  return (
    <div className="p-2 rounded-lg bg-aerospace-900/60 border border-slate-800/80">
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-slate-400">{label}</span>
        <span className={`font-bold ${isWarning ? 'text-hud-amber' : 'text-hud-cyan'}`}>
          {value.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">{unit}</span>
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 ${
            isWarning 
              ? 'bg-hud-amber shadow-hud-glow-amber' 
              : 'bg-hud-cyan shadow-hud-glow'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
